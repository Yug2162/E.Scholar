# New features: Final Exam + No-skip lectures

This branch adds two features:

1. **No skipping ahead in lectures.** Students can't drag the video forward past
   the furthest point they've watched. They can always rewind.
2. **Final exam.** The instructor builds a timed multiple-choice exam for each course.
   Students can take it after finishing every lecture. The certificate is only
   issued after they pass.

---

## Running it on your PC

Nothing new to install, and there are **no new `.env` variables**.

```bash
# 1. install (once)
npm install
cd server && npm install && cd ..

# 2. start frontend + backend together
npm run dev
```

The frontend runs on http://localhost:3000 and the API on http://localhost:4000.
Your existing `.env` (root) and `server/.env` work as they are.

### Quick demo (no database or email needed)

Runs the API on a throwaway in-memory MongoDB with a ready-made course
(2 short lectures), so your real database is never touched:

```bash
cd server
node scripts/demoLocal.js      # API on :4000, stop with Ctrl+C (data is deleted)
```

In a second terminal, start the frontend with `npm start` in the project root.
Your root `.env` must have `REACT_APP_BASE_URL=http://localhost:4000/api/v1`.

| Account | Password | Role |
|---|---|---|
| `teacher@demo.local` | `Demo@123` | Instructor (owns "Demo Course") |
| `student@demo.local` | `Demo@123` | Student (enrolled) |

Signing up for a new account won't email an OTP in demo mode. The OTP is
printed in the API terminal instead.

Run the backend tests (they use an in-memory MongoDB, so your real database is never touched):

```bash
cd server
npx jest tests/examAndVideoLock.test.js
```

> **If every test times out** with `buffering timed out after 10000ms`: a fresh
> `npm install` pulls a newer mongoose (9.13+) that ships its own MongoDB
> driver, which breaks the in-memory database under jest. This affects the
> existing tests too, not just the new ones. Fix it locally with:
> `npm install mongoose@9.7.0 --no-save`
> (the app itself runs fine on either version).

---

## How to try it

### Final exam
1. Log in as an **Instructor**, then go to **Dashboard → My Courses**.
2. Click the new **clipboard icon** next to a course's edit button.
3. Set the title, time limit, pass mark and max attempts (0 = unlimited). Add
   questions, pick the correct option with the radio button, then click **Publish Exam**.
4. Log in as a **Student** enrolled in that course and open the course.
   The sidebar now shows **Final Exam** (🔒 until every lecture is complete).
5. Finish the lectures, then open Final Exam and click **Start Exam**.
   - There's a countdown timer, and the exam submits itself when time runs out.
   - Refreshing the page resumes the same attempt with the answers kept.
   - Pass: the certificate is issued and **Download Certificate** appears.
   - Fail: shows the score and which answers were wrong. Correct answers are
     only revealed after passing.

### No-skip video
1. As a student, open a lecture you haven't completed.
2. Try dragging the progress bar forward: the video jumps back, and a toast says
   *"You can't skip ahead in this lecture"*.
3. The speed menu is hidden, and the bar under the video shows `Watched x / y`.
4. Leave and come back: the video continues from where you stopped.
5. **Mark As Completed** only works once the video has played to the end.
6. Lectures you've already completed can be scrubbed freely.

---

## How it works

| | Where |
|---|---|
| Watch progress saved every 10s (furthest point reached) | `src/components/core/ViewCourse/VideoDetails.jsx` |
| Server limits progress to real playback speed, so faking a jump with a direct API call doesn't work | `server/controllers/courseProgress.js` → `updateWatchProgress` |
| Lecture can only be marked complete after it was watched to the end | `server/controllers/courseProgress.js` → `updateCourseProgress` |
| Exam + attempt models | `server/models/Exam.js`, `server/models/ExamAttempt.js` |
| Exam API (`/api/v1/exam/...`) | `server/controllers/Exam.js`, `server/routes/Exam.js` |
| Certificate rule: all lectures done **and** exam passed (if the course has one) | `server/utils/courseCompletion.js` |
| Instructor exam builder | `src/components/core/Dashboard/ExamBuilder.jsx` |
| Student exam page | `src/components/core/ViewCourse/ExamPage.jsx` |

Exam security:
- Correct answers are never sent to the browser before the student submits.
- Grading and the time limit are checked on the server.
- A late submission counts as a fail, and an attempt can only be submitted once.

### API

| Method | Route | Who |
|---|---|---|
| GET | `/exam/instructor/:courseId` | Instructor (own course) |
| POST | `/exam/save` | Instructor |
| DELETE | `/exam/:courseId` | Instructor |
| GET | `/exam/status/:courseId` | Enrolled student |
| POST | `/exam/start` | Enrolled student |
| POST | `/exam/submit` | Enrolled student |
| POST | `/course/updateWatchProgress` | Enrolled student |

### Good to know
- Courses **without** an exam work like before: the certificate is issued
  when the last lecture is completed.
- Students who completed lectures before this update keep their completed
  lectures. Their in-progress lectures start tracking from 0:00.
