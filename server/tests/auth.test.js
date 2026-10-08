const request = require('supertest')
const app = require('../index')

// Helper — full signup flow with OTP
const signupUser = async (email, accountType = 'Student') => {
  // Step 1: Send OTP
  await request(app)
    .post('/api/v1/auth/sendotp')
    .send({ email })

  // Step 2: Get OTP from DB directly
  const OTP = require('../models/OTP')
  const otpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 })
  const otp = otpDoc?.otp

  // Step 3: Signup with OTP
  const res = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      firstName: 'Test',
      lastName: 'User',
      email,
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      accountType,
      otp
    })
  return res
}

describe('🔐 Auth Routes', () => {

  describe('POST /api/v1/auth/sendotp', () => {

    it('should send OTP to new email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sendotp')
        .send({ email: 'newotp@test.com' })
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('should not send OTP to already registered email', async () => {
      await signupUser('registered@test.com')
      const res = await request(app)
        .post('/api/v1/auth/sendotp')
        .send({ email: 'registered@test.com' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/v1/auth/signup', () => {

    it('should register a new student successfully', async () => {
      const res = await signupUser('newstudent@test.com', 'Student')
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('should not register with mismatched passwords', async () => {
      // Send OTP first
      await request(app)
        .post('/api/v1/auth/sendotp')
        .send({ email: 'mismatch@test.com' })

      const OTP = require('../models/OTP')
      const otpDoc = await OTP.findOne({ email: 'mismatch@test.com' }).sort({ createdAt: -1 })

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'mismatch@test.com',
          password: 'Test@1234',
          confirmPassword: 'WrongPass',
          accountType: 'Student',
          otp: otpDoc?.otp
        })
      expect(res.body.success).toBe(false)
    })

    it('should not register without OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'nootp@test.com',
          password: 'Test@1234',
          confirmPassword: 'Test@1234',
          accountType: 'Student'
        })
      expect(res.statusCode).toBe(403)
    })

    it('should not register duplicate email', async () => {
      await signupUser('duplicate@test.com')
      const res = await signupUser('duplicate@test.com')
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/login', () => {

    beforeEach(async () => {
      await signupUser('logintest@test.com', 'Student')
    })

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'logintest@test.com', password: 'Test@1234' })
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'logintest@test.com', password: 'WrongPass' })
      expect(res.statusCode).toBe(401)
    })

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@test.com', password: 'Test@1234' })
      expect(res.statusCode).toBe(401)
    })

    it('should reject missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'logintest@test.com' })
      expect(res.statusCode).toBe(400)
    })
  })
})