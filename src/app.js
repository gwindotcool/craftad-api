const express = require("express");
const app = express();

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const listEndpoints = require("express-list-endpoints");

const { apiLimiter } = require("./middleware/rateLimiter");

global.onlineUsers = new Map();

// Routes
const healthRoute = require("./routes/health.route");
const authRoute = require("./routes/auth.route");
const artisanRoute = require("./routes/artisan.route");
const jobRoute = require("./routes/job.route");
const reviewRoute = require("./routes/review.route");
const notificationRoute = require("./routes/notification.route");
const statusRoute = require("./routes/status.route");
const paymentRoute = require("./routes/payment.route");
const walletRoutes = require("./routes/wallet.route");
const adminRoutes = require("./routes/admin.route");

//GLOBAL MIDDLEWARE

// Enable CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// Secure HTTP headers
app.use(helmet());

// Compress responses
app.use(compression());

// Log requests
app.use(morgan("dev"));

// Parse JSON and keep raw body for Paystack webhook
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Prevent NoSQL Injection
// app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Global API Rate Limiter
app.use("/api", apiLimiter);

   //ROUTES

app.use("/api", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/artisan", artisanRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/status", statusRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

// DEVELOPMENT ONLY

if (process.env.NODE_ENV === "development") {
    console.table(listEndpoints(app));
}

module.exports = app;