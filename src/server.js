const http = require('http');
const { Server } = require('socket.io');
require("./jobs/escrowReleaseJob");
require('dotenv').config();
const connectDB = require('./config/database');

const app = require("./app");



const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

global.io = io;
const onlineUsers = new Map();
global.onlineUsers = onlineUsers;

io.use((socket, next) => {
    try {

        const token =
            socket.handshake.auth.token;

        if (!token) {
            return next(
                new Error("Authentication required")
            );
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        socket.user = decoded;

        next();

    } catch (error) {

        next(
            new Error("Invalid token")
        );
    }
});


io.on("connection", (socket) => {

    const userId = socket.user.id;

    socket.join(userId);

    onlineUsers.set(
        userId,
        socket.id
    );

    console.log(
        `${userId} is online`
    );

    console.log(
        "ONLINE USERS:",
        [...onlineUsers.keys()]
    );

    socket.on(
        "disconnect",
        () => {

            onlineUsers.delete(userId);

            console.log(
                `${userId} offline`
            );

            console.log(
                "ONLINE USERS:",
                [...onlineUsers.keys()]
            );
        }
    );
});


connectDB()


    .then(() => {
        // Use the ENV port, or default to 5000 if it's missing
        const PORT = process.env.PORT || 5000;
        const ENV = process.env.NODE_ENV || 'development';

        server.listen(PORT, () => {
            console.log(`🚀 Server running in ${ENV} mode on port ${PORT}`);
        });
    })
    .catch(error => {
        console.log('❌ Failed to start server:', error.message);
        process.exit(1); // Stop the script if the DB fails
    });