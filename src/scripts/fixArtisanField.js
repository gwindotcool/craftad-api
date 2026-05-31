require("dotenv").config();

const connectDB =
    require("../config/database");

const Job =
    require("../models/Job");

const fixJobs = async () => {
    try {

        await connectDB();

        const result =
            await Job.collection.updateMany(
                {},
                {
                    $unset: {
                        artisan: ""
                    }
                }
            );

        console.log(result);

        console.log(
            "artisan field removed"
        );

        process.exit();

    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

fixJobs();