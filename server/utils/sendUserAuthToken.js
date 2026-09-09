import jwt from "jsonwebtoken";

const maskPhone = (phone = "") => {
    const value = String(phone);

    if (value.length < 10) return value;

    return `${value.slice(0, 2)}******${value.slice(-2)}`;
};

export const userPayload = (user) => ({
    id: user._id,
    name: user.name,
    phone: maskPhone(user.phone),
    isActive: user.isActive,
    profile: user.profileImage || "",
});

export const sendUserAuthToken = async (
    user,
    statusCode,
    res
) => {
    try {
        const isProd = process.env.NODE_ENV === "production";

        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign(
            {
                sub: user._id,
                phone: user.phone, // keep original inside 
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || "365d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge:
                (process.env.COOKIE_EXPIRES || 365) *
                24 *
                60 *
                60 *
                1000,
            ...(isProd && {
                domain: process.env.COOKIE_DOMAIN,
            }),
        });

        return res.status(statusCode).json({
            success: true,
            user: userPayload(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const clearUserAuthToken = (res) => {
    const isProd = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        ...(isProd && {
            domain: process.env.COOKIE_DOMAIN,
        }),
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};