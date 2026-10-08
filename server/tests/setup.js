const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

// ✅ Mock mailSender
jest.mock('../utils/mailSender', () => 
  jest.fn().mockResolvedValue({ success: true })
)

// ✅ Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  cloudinaryConnect: jest.fn()
}))

// ✅ Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}))

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  process.env.NODE_ENV = 'test'
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})