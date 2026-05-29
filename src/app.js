const express = require('express');
const app = express();
const healthRoute = require("./routes/health.route");
const authRoute = require("./routes/auth.route")
const artisanRoute = require("./routes/artisan.route")
const jobRoute = require("./routes/job.route")
const reviewRoute = require("./routes/review.route")
const notificationRoute = require("./routes/notification.route")
const statusRoute = require("./routes/status.route")

app.use(express.json());

app.use("/api", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/artisan", artisanRoute)
app.use("/api/jobs", jobRoute);
app.use("/api/reviews",  reviewRoute)
app.use("/api/notifications", notificationRoute);
app.use("/api/status", statusRoute);



module.exports = app;