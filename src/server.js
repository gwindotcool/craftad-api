require('dotenv').config();
const connectDB = require('./config/database');

const app = require("./app");
const PORT = process.env.PORT || 5000;



connectDB()


    .then(() => {
        // Use the ENV port, or default to 5000 if it's missing
        const PORT = process.env.PORT || 5000;
        const ENV = process.env.NODE_ENV || 'development';

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${ENV} mode on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log('❌ Failed to start server:', error.message);
        process.exit(1); // Stop the script if the DB fails
    });