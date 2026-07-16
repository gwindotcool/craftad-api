const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const onlineUsers = new Map();

const initializeSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;

            next();

        } catch (error) {

            next(new Error("Invalid token"));

        }

    });

    io.on("connection", (socket) => {

        const userId = socket.user.id;

        socket.join(userId);

        onlineUsers.set(userId, socket.id);

        console.log(`${userId} connected`);

        socket.on("disconnect", () => {

            onlineUsers.delete(userId);

            console.log(`${userId} disconnected`);

        });

    });

    return io;

};

const getIO = () => {

    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;

};

module.exports = {
    initializeSocket,
    getIO,
    onlineUsers
};