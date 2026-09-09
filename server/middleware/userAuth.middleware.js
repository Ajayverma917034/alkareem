// middleware/userAuthMiddleware.js

import jwt from "jsonwebtoken";
import User from "../schema/user.schema.js";

const userAuthMiddleware = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];


        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.sub);

        console.log(user)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isActive || user.deletedAt) {
            return res.status(403).json({
                success: false,
                message: "Account disabled",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default userAuthMiddleware;