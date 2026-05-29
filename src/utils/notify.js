const Notification =
    require("../models/Notification.model");

exports.sendNotification = async ({
                                      user,
                                      title,
                                      message,
                                      type = "system",
                                  }) => {
    console.log("NOTIFICATION FUNCTION HIT");

    const userId =
        user?._id
            ? user._id.toString()
            : user.toString();

    console.log("EMIT TARGET:", userId);

    const notification =
        await Notification.create({
            user: userId,
            title,
            message,
            type,
        });

    console.log("EMITTING NOW...");

    global.io
        .to(userId)
        .emit("notification", notification);

    console.log("EMIT DONE");

    return notification;
};