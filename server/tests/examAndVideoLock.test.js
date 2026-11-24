// Tests for the final exam and the "no skipping ahead" video lock
const request = require("supertest")
const jwt = require("jsonwebtoken")
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret"
const app = require("../index")

const User = require("../models/User")
const Profile = require("../models/Profile")
const Course = require("../models/Course")
const Section = require("../models/Section")
const SubSection = require("../models/Subsection")
const CourseProgress = require("../models/CourseProgress")
const Certificate = require("../models/Certificate")
const ExamAttempt = require("../models/ExamAttempt")

const tokenFor = (user) =>
  jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  })

const makeUser = async (accountType, email) =>
  User.create({
    firstName: accountType,
    lastName: "Tester",
    email,
    password: "hashed",
    accountType,
    additionalDetails: (await Profile.create({}))._id,
  })

let instructor, student, outsider, course, lectures
let iTok, sTok, oTok

const examBody = (overrides = {}) => ({
  courseId: course._id,
  title: "Final Exam",
  description: "Covers everything",
  durationMinutes: 10,
  passPercentage: 50,
  maxAttempts: 2,
  questions: [
    { question: "2 + 2 = ?", options: ["3", "4", "5"], correctOption: 1, marks: 1 },
    { question: "Capital of India?", options: ["Delhi", "Mumbai"], correctOption: 0, marks: 3 },
  ],
  ...overrides,
})

// Pretend the student watched a lecture to the end, then mark it complete
async function watchAndComplete(sub) {
  const p = await CourseProgress.findOne({ courseID: course._id, userId: student._id })
  p.watchProgress.push({ subSection: sub._id, maxWatched: 100, lastUpdate: new Date() })
  await p.save()
  return request(app)
    .post("/api/v1/course/updateCourseProgress")
    .set("Authorization", `Bearer ${sTok}`)
    .send({ courseId: course._id, subsectionId: sub._id })
}

beforeEach(async () => {
  instructor = await makeUser("Instructor", "inst@test.com")
  student = await makeUser("Student", "stud@test.com")
  outsider = await makeUser("Student", "other@test.com")
  ;[iTok, sTok, oTok] = [instructor, student, outsider].map(tokenFor)

  lectures = await SubSection.create([
    { title: "L1", timeDuration: "100", videoUrl: "x" },
    { title: "L2", timeDuration: "100", videoUrl: "y" },
  ])
  const section = await Section.create({
    sectionName: "S1",
    subSection: lectures.map((l) => l._id),
  })
  course = await Course.create({
    courseName: "Test Course",
    courseDescription: "desc",
    instructor: instructor._id,
    tag: ["t"],
    courseContent: [section._id],
    studentsEnroled: [student._id],
    status: "Published",
  })
  await CourseProgress.create({ courseID: course._id, userId: student._id, completedVideos: [] })
})

describe("🎬 Video lock (no skipping ahead)", () => {
  const send = (currentTime, sub = lectures[0]) =>
    request(app)
      .post("/api/v1/course/updateWatchProgress")
      .set("Authorization", `Bearer ${sTok}`)
      .send({ courseId: course._id, subsectionId: sub._id, currentTime })

  it("accepts normal progress", async () => {
    const res = await send(10)
    expect(res.statusCode).toBe(200)
    expect(res.body.maxWatched).toBe(10)
    expect(res.body.clamped).toBe(false)
  })

  it("rejects a jump to the end of the video", async () => {
    const res = await send(95)
    expect(res.statusCode).toBe(200)
    expect(res.body.clamped).toBe(true)
    expect(res.body.maxWatched).toBeLessThan(20)
  })

  it("lets watched time grow only as fast as real time", async () => {
    await send(10)
    // move the last save 40s into the past → at most ~10 + 40*1.25 + 15 = 75
    const p = await CourseProgress.findOne({ courseID: course._id, userId: student._id })
    p.watchProgress[0].lastUpdate = new Date(Date.now() - 40 * 1000)
    await p.save()
    const res = await send(99)
    expect(res.body.clamped).toBe(true)
    expect(res.body.maxWatched).toBeGreaterThanOrEqual(74)
    expect(res.body.maxWatched).toBeLessThanOrEqual(76)
  })

  it("never lowers saved progress when the student seeks back", async () => {
    await send(12)
    const res = await send(3)
    expect(res.body.maxWatched).toBe(12)
  })

  it("refuses to mark a lecture complete that wasn't watched", async () => {
    await send(10)
    const res = await request(app)
      .post("/api/v1/course/updateCourseProgress")
      .set("Authorization", `Bearer ${sTok}`)
      .send({ courseId: course._id, subsectionId: lectures[0]._id })
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/watch the full lecture/i)
  })

  it("marks a fully watched lecture complete", async () => {
    const res = await watchAndComplete(lectures[0])
    expect(res.statusCode).toBe(200)
  })

  it("returns watch progress with the course details", async () => {
    await send(8)
    const res = await request(app)
      .post("/api/v1/course/getFullCourseDetails")
      .set("Authorization", `Bearer ${sTok}`)
      .send({ courseId: course._id })
    expect(res.statusCode).toBe(200)
    expect(res.body.data.watchProgress[lectures[0]._id.toString()]).toBe(8)
  })

  it("still issues the certificate when the course has no exam", async () => {
    await watchAndComplete(lectures[0])
    const res = await watchAndComplete(lectures[1])
    expect(res.body.certificateIssued).toBe(true)
  })
})

describe("📝 Final exam — instructor", () => {
  it("saves and reads back an exam", async () => {
    const save = await request(app)
      .post("/api/v1/exam/save")
      .set("Authorization", `Bearer ${iTok}`)
      .send(examBody())
    expect(save.statusCode).toBe(200)

    const get = await request(app)
      .get(`/api/v1/exam/instructor/${course._id}`)
      .set("Authorization", `Bearer ${iTok}`)
    expect(get.body.data.exam.questions).toHaveLength(2)
    expect(get.body.data.exam.questions[0].correctOption).toBe(1)
  })

  it("validates questions", async () => {
    const res = await request(app)
      .post("/api/v1/exam/save")
      .set("Authorization", `Bearer ${iTok}`)
      .send(examBody({ questions: [{ question: "Q", options: ["a", "b"], correctOption: 5 }] }))
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/correct option/i)
  })

  it("does not let another instructor edit the exam", async () => {
    const other = await makeUser("Instructor", "inst2@test.com")
    const res = await request(app)
      .post("/api/v1/exam/save")
      .set("Authorization", `Bearer ${tokenFor(other)}`)
      .send(examBody())
    expect(res.statusCode).toBe(404)
  })

  it("does not let students create exams", async () => {
    const res = await request(app)
      .post("/api/v1/exam/save")
      .set("Authorization", `Bearer ${sTok}`)
      .send(examBody())
    expect(res.statusCode).toBe(401)
  })
})

describe("📝 Final exam — student", () => {
  beforeEach(async () => {
    await request(app)
      .post("/api/v1/exam/save")
      .set("Authorization", `Bearer ${iTok}`)
      .send(examBody())
  })

  const status = (tok = sTok) =>
    request(app).get(`/api/v1/exam/status/${course._id}`).set("Authorization", `Bearer ${tok}`)
  const start = () =>
    request(app)
      .post("/api/v1/exam/start")
      .set("Authorization", `Bearer ${sTok}`)
      .send({ courseId: course._id })
  const submit = (attemptId, answers) =>
    request(app)
      .post("/api/v1/exam/submit")
      .set("Authorization", `Bearer ${sTok}`)
      .send({ attemptId, answers })
  const finishLectures = async () => {
    await watchAndComplete(lectures[0])
    return watchAndComplete(lectures[1])
  }

  it("is locked until all lectures are complete", async () => {
    const s = await status()
    expect(s.body.data.hasExam).toBe(true)
    expect(s.body.data.canStart).toBe(false)
    const res = await start()
    expect(res.statusCode).toBe(403)
  })

  it("blocks students who are not enrolled", async () => {
    const res = await status(oTok)
    expect(res.statusCode).toBe(403)
  })

  it("holds the certificate back until the exam is passed", async () => {
    const res = await finishLectures()
    expect(res.body.certificateIssued).toBe(false)
    expect(await Certificate.countDocuments()).toBe(0)

    const dl = await request(app)
      .get(`/api/v1/certificate/download/${course._id}`)
      .set("Authorization", `Bearer ${sTok}`)
    expect(dl.statusCode).toBe(404)
    expect(dl.body.message).toMatch(/final exam/i)
  })

  it("never sends correct answers when starting", async () => {
    await finishLectures()
    const res = await start()
    expect(res.statusCode).toBe(200)
    expect(res.body.data.questions).toHaveLength(2)
    res.body.data.questions.forEach((q) => expect(q.correctOption).toBeUndefined())
  })

  it("resumes the same attempt after a refresh", async () => {
    await finishLectures()
    const a = await start()
    const b = await start()
    expect(b.body.data.attemptId).toBe(a.body.data.attemptId)
  })

  it("grades on the server, passes, and issues the certificate", async () => {
    await finishLectures()
    const { attemptId } = (await start()).body.data
    // Q2 is worth 3 of 4 marks → 75% ≥ 50%
    const res = await submit(attemptId, [0, 0])
    expect(res.statusCode).toBe(200)
    expect(res.body.data.score).toBe(3)
    expect(res.body.data.percentage).toBe(75)
    expect(res.body.data.passed).toBe(true)
    expect(res.body.data.certificateIssued).toBe(true)
    expect(res.body.data.review[0].correctOption).toBe(1)
    expect(await Certificate.countDocuments({ userId: student._id })).toBe(1)
  })

  it("fails a low score, hides answers, and counts attempts", async () => {
    await finishLectures()
    const { attemptId } = (await start()).body.data
    const res = await submit(attemptId, [1, 1]) // 1 of 4 = 25%
    expect(res.body.data.passed).toBe(false)
    expect(res.body.data.review[0].correctOption).toBeUndefined()

    const s = await status()
    expect(s.body.data.attemptsLeft).toBe(1)
    expect(s.body.data.canStart).toBe(true)
  })

  it("rejects a second submit of the same attempt", async () => {
    await finishLectures()
    const { attemptId } = (await start()).body.data
    await submit(attemptId, [1, 1])
    const again = await submit(attemptId, [1, 0])
    expect(again.statusCode).toBe(400)
  })

  it("stops after the maximum number of attempts", async () => {
    await finishLectures()
    for (let i = 0; i < 2; i++) {
      const { attemptId } = (await start()).body.data
      await submit(attemptId, [-1, -1])
    }
    const res = await start()
    expect(res.statusCode).toBe(403)
    expect(res.body.message).toMatch(/no attempts left/i)
  })

  it("fails a submission that arrives after the time limit", async () => {
    await finishLectures()
    const { attemptId } = (await start()).body.data
    await ExamAttempt.updateOne(
      { _id: attemptId },
      { expiresAt: new Date(Date.now() - 5 * 60 * 1000) }
    )
    const res = await submit(attemptId, [1, 0])
    expect(res.body.data.late).toBe(true)
    expect(res.body.data.passed).toBe(false)
  })

  it("closes attempts abandoned past their time limit", async () => {
    await finishLectures()
    const { attemptId } = (await start()).body.data
    await ExamAttempt.updateOne(
      { _id: attemptId },
      { expiresAt: new Date(Date.now() - 5 * 60 * 1000) }
    )
    const s = await status()
    expect(s.body.data.activeAttempt).toBeNull()
    expect(s.body.data.attempts).toHaveLength(1)
    expect(s.body.data.attemptsLeft).toBe(1)
  })
})
