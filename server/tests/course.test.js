const request = require('supertest')
const app = require('../index')

let studentToken
let instructorToken

const signupAndLogin = async (email, accountType) => {
  await request(app)
    .post('/api/v1/auth/sendotp')
    .send({ email })

  const OTP = require('../models/OTP')
  const otpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 })

  await request(app)
    .post('/api/v1/auth/signup')
    .send({
      firstName: accountType,
      lastName: 'Test',
      email,
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      accountType,
      otp: otpDoc?.otp
    })

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Test@1234' })

  return res.body.token
}

beforeEach(async () => {
  studentToken = await signupAndLogin('student@test.com', 'Student')
  instructorToken = await signupAndLogin('instructor@test.com', 'Instructor')
})

describe('📚 Course Routes', () => {

  it('should fetch all courses without auth', async () => {
    const res = await request(app).get('/api/v1/course/getAllCourses')
    expect(res.statusCode).toBe(200)
  })

  it('should not allow student to create course', async () => {
    const res = await request(app)
      .post('/api/v1/course/createCourse')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ courseName: 'Test Course', price: 999 })
    expect(res.statusCode).toBe(401)
  })

  it('should allow instructor to create course', async () => {
  const res = await request(app)
    .post('/api/v1/course/createCourse')
    .set('Authorization', `Bearer ${instructorToken}`)
    .send({
      courseName: 'Test Course',
      courseDescription: 'Test Description',
      price: 999,
      whatYouWillLearn: 'Testing',
      tag: JSON.stringify(['test']),
      status: 'Draft'
    })
  expect(res.statusCode).toBe(200)
})
  it('should not create course without auth', async () => {
    const res = await request(app)
      .post('/api/v1/course/createCourse')
      .send({ courseName: 'Unauthorized Course' })
    expect(res.statusCode).toBe(401)
  })
})