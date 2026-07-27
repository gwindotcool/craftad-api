const Notification = require("../models/Notification.model");

const { getIO } = require("../sockets/sockets");

exports.sendNotification = async ({
         user,
         title,
         message,
         type = "system",
     }) => {

    try {

        const userId =

            user?._id

                ? user._id.toString()

                : user.toString();

// Save to database

        const notification = await Notification.create({

            user: userId,

            title,

            message,

            type,

        });

// Emit in real-time

        const io = getIO();

        io.to(userId).emit("notification", notification);

        return notification;

    } catch (error) {

        console.error("Notification error:", error.message);

    }

};