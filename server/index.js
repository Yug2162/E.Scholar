// Importing necessary modules and packages
const express = require("express");
const app = express();
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const certificateRoutes = require("./routes/Certificate");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Loading environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000",
  "https://e-scholar-ten.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp/",
  })
);

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/certificate", certificateRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ...",
  });
});

// ✅ KEY CHANGE — only connect DB and start server if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  database.connect();
  cloudinaryConnect();
  app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`);
  });
}

// ✅ Export app for tests
module.exports = app;