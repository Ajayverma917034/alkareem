// middleware/userAuthMiddleware.js

import jwt from "jsonwebtoken";
import Admin from "../schema/admin.schema.js";

const adminAuthMiddleware = async (req, res, next) => {
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

        const user = await Admin.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // if (!user.isActive || user.deletedAt) {
        //     return res.status(403).json({
        //         success: false,
        //         message: "Account disabled",
        //     });
        // }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default adminAuthMiddleware;