const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        const { fullName, email ,phone , password, role } = req.body;
        const existingUser = await User.findOne({
            $or: [
                {email},
                {phone},
            ],
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            })
        }
        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            role,
        })
        const userResponse = user.toObject();
        delete userResponse.password;



        res.status(201).json({
            success: true,
            message:
                "User registered successfully",
            data: userResponse,
        });

    }catch(err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email})
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user not found",
            })
        }
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
        },
            process.env.JWT_SECRET,
            { expiresIn:"7d"}
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "incorrect password",
            })
        }
        return res.status(200).json({
            success: true,
            message: "login successfully",
            data:{
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                token,
            }
        })
    }catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
