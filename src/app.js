const express = require('express');
const app = express();
const healthRoute = require("./routes/health.route");
const authRoute = require("./routes/auth.route")
const artisanRoute = require("./routes/artisan.route")
const jobRoute = require("./routes/job.route")

app.use(express.json());

app.use("/api", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/artisan", artisanRoute)
app.use("/api/jobs", jobRoute);

module.exports = app;