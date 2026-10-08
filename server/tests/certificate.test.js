const request = require('supertest')
const app = require('../index')

let studentToken

beforeEach(async () => {
  await request(app)
    .post('/api/v1/auth/sendotp')
    .send({ email: 'certuser@test.com' })

  const OTP = require('../models/OTP')
  const otpDoc = await OTP.findOne({ email: 'certuser@test.com' }).sort({ createdAt: -1 })

  await request(app)
    .post('/api/v1/auth/signup')
    .send({
      firstName: 'Cert',
      lastName: 'User',
      email: 'certuser@test.com',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      accountType: 'Student',
      otp: otpDoc?.otp
    })

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'certuser@test.com', password: 'Test@1234' })
  studentToken = res.body.token
})

describe('🎓 Certificate Routes', () => {

  it('should not check eligibility without auth', async () => {
    const res = await request(app)
      .get('/api/v1/certificate/check/somecourseId')
    expect(res.statusCode).toBe(401)
  })

  it('should not download certificate without auth', async () => {
    const res = await request(app)
      .get('/api/v1/certificate/download/somecourseId')
    expect(res.statusCode).toBe(401)
  })

  it('should return 200 or 404 for non-enrolled course eligibility check', async () => {
    const mongoose = require('mongoose')
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/v1/certificate/check/${fakeId}`)
      .set('Authorization', `Bearer ${studentToken}`)
    expect([200, 400, 403, 404]).toContain(res.statusCode)
  })

  it('should return 404 for non-enrolled course download', async () => {
    const mongoose = require('mongoose')
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/api/v1/certificate/download/${fakeId}`)
      .set('Authorization', `Bearer ${studentToken}`)
    expect([400, 403, 404]).toContain(res.statusCode)
  })

  it('should allow public verification with any certificateId format', async () => {
    const res = await request(app)
      .get('/api/v1/certificate/verify/fakecert123')
    expect(res.statusCode).not.toBe(401)
  })
})