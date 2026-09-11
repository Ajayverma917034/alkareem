import Plan from "../schema/plan.schema.js";
import dayjs from "dayjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../schema/admin.schema.js";
import Volunteer from "../schema/volunteer.schema.js";
import Dignitary from "../schema/dignitary.schema.js";
import { getRazorpayPeriod, razorpay } from "../utils/razorpay.js";
import Donation from "../schema/donation.schema.js";
import User from "../schema/user.schema.js";
import Payment from "../schema/payment.schema.js";
import Contact from "../schema/contact.schema.js";
import Subscription from "../schema/subscription.schema.js";
import ExcelJS from "exceljs";
import { sendEmail } from "../utils/sendmail.js";

// import { loginValidate, registerValidate } from "../validations/RegisterValidation.js";
// import { sendEmail } from "../sendmail/Mail.js";
// import Admin from "../schema/admin.schema.js";


// generate token 

const generateToken = (payload, expiresIn = "365d") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Set cookie options
const cookieOption = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }
    try {

        const existingAdmin = await Admin.findOne({ email }).select("+password");

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Admin({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();


        const token = generateToken({ id: newUser._id });

        cookieOption(res, token);

        return res.status(201).json({ success: true, message: "User registered successfully", user: newUser.name, email: newUser.email });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error occurred while registering user" });
    }
}

export const LoginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    try {


        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!admin.isUserVerify) {
            return res.json({
                success: false,
                message: "Please verify your email first"
            });
        }


        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateToken({ id: admin._id });

        cookieOption(res, token);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: admin._id,
                token: token,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error occurred while logging in" });
    }
}


export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

        });
        return res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error occurred while logging out" });
    }
}


export const senduserOtp = async (req, res) => {
    try {

        // const { userId } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const { id } = req.user;
        // console.log("User ID :", id);

        const user = await User.findById(id);
        if (user.isUserVerify) {
            return res.status(200).json({ success: true, message: "User already verified" });
        }

        const otpvalue = String(Math.floor(Math.random() * 900000 + 100000));
        user.otp = otpvalue;
        // console.log("OTP for user verification:", otpvalue);
        user.otpExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendEmail({
            to: user.email,
            subject: "Verify your account",
            html: `<h1>OTP for account verification</h1><p>Your OTP for account verification is <b>${otpvalue}</b>. It will expire in 10 minutes.</p><p>Best regards,<br/>The All Kareem Tarbiyat Team</p>`,
        });
        return res.status(200).json({ success: true, message: "OTP sent to email for verification" });

    } catch (error) {
        return res.status(500).json({ message: "Error occurred while verifying user" });
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const { id: userId } = req.user;
        if (!userId || !otp) {
            return res.status(400).json({ message: "Please provide userId and otp" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.isUserVerify = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        return res.status(200).json({ success: true, message: "OTP verified successfully" });


    } catch (error) {
        return res.status(500).json({ message: "Error occurred while verifying OTP" });
    }
}

// password reset otp send
// send OTP to admin's email for password reset
export const adminForgotPasswordOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        const otpvalue = String(Math.floor(Math.random() * 900000 + 100000));
        admin.resetOtp = otpvalue;
        admin.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 min

        await admin.save();

        await sendEmail({
            to: admin.email,
            subject: "Admin Password Reset OTP",
            html: `<h1>Password Reset</h1><p>Your OTP for password reset is <b>${otpvalue}</b>. It will expire in 10 minutes. If you did not request this, ignore this email.</p><p>Best regards,<br/>The All Kareem Tarbiyat Team</p>`,
        });

        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occurred while sending reset OTP", error: error.message });
    }
};

// verify OTP + set new password
export const adminResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Please provide email, otp and new password" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        const admin = await Admin.findOne({ email }).select("+password");
        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        if (!admin.resetOtp || admin.resetOtp !== otp || admin.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetOtp = "";
        admin.resetOtpExpire = 0;

        await admin.save();

        await sendEmail({
            to: admin.email,
            subject: "Password Reset Successful",
            html: `<h1>Password Reset Successful</h1><p>Your admin password was just changed. If this wasn't you, contact support immediately.</p><p>Best regards,<br/>The All Kareem Tarbiyat Team</p>`,
        });

        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occurred while resetting password", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide current and new password" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different from current password" });
        }

        const admin = await Admin.findById(req.user.id).select("+password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error occurred while updating password" });
    }
};

// these are not used for reset password
export const resetPasswordOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Please provide email" })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const otpvalue = String(Math.floor(Math.random() * 900000 + 100000));
        user.resetOtp = otpvalue;
        // console.log("OTP for user verification:", otpvalue);
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        await sendEmail({
            to: user.email,
            subject: "Password Reset OTP",
            html: `<h1>OTP for password reset</h1><p>Your OTP for password reset is <b>${otpvalue}</b>. It will expire in 10 minutes.</p><p>Best regards,<br/>The All Kareem Tarbiyat Team</p>`,
        });
        return res.status(200).json({ success: true, message: "OTP sent to email for verification" });

    } catch (error) {
        return res.status(500).json({ message: "Error occurred while resending OTP", error: error.message });
    }
}

// verify and reset password 

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Please provide email, otp and new password" })
    }

    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        if (user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: "Password Reset Successful",
            html: `<h1>Password Reset Successful</h1><p>Your password has been reset successfully. You can now log in with your new password ${newPassword}.</p><p>Best regards,<br/>The All Kareem Tarbiyat Team</p>`,
        });
        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error occurred while verifying reset OTP", error: error.message });
    }
}

// GET all plans (admin)
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.aggregate([
            {
                $lookup: {
                    from: "users", // your users collection name
                    localField: "_id",
                    foreignField: "planId", // user schema field storing selected plan
                    as: "subscribers"
                }
            },
            {
                $addFields: {
                    subscriberCount: { $size: "$subscribers" }
                }
            },
            {
                $project: {
                    subscribers: 0
                }
            },
            {
                $sort: {
                    order: 1
                }
            }
        ]);

        res.status(200).json(plans);
    } catch (err) {
        res.status(500).json({
            message: err.message || "Failed to fetch plans"
        });
    }
};

// GET single plan
export const getSinglePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.json(plan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// CREATE plan
export const createPlan = async (req, res) => {
    try {
        const {
            name,
            price,
            billingPeriod,
            billingLabel,
            annualEquivalent,
            accentColor,
            buttonColor,
            badge,
            badgeColor,
            isMostPopular,
            features,
            order,
            isActive,
        } = req.body;

        if (!name || price === undefined || !billingPeriod) {
            return res.status(400).json({
                message: "name, price, billingPeriod required",
            });
        }

        const { period, interval } =
            getRazorpayPeriod(billingPeriod);

        /* Create Razorpay Plan */
        const rzpPlan =
            await razorpay.plans.create({
                period,
                interval,
                item: {
                    name,
                    amount: Math.round(
                        Number(price) * 100
                    ),
                    currency: "INR",
                    description:
                        `${name} Membership`,
                },
            });

        /* Save Mongo Plan */
        const plan = await Plan.create({
            name,
            price,
            billingPeriod,
            billingLabel,
            annualEquivalent,
            accentColor,
            buttonColor,
            badge,
            badgeColor,
            isMostPopular,
            features,
            order,
            isActive,
            razorpayPlanId: rzpPlan.id,
        });

        res.status(201).json(plan);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to create plan",
        });
    }
};

// UPDATE plan
export const updatePlan = async (req, res) => {
    try {
        const oldPlan =
            await Plan.findById(req.params.id);

        if (!oldPlan) {
            return res.status(404).json({
                message: "Plan not found",
            });
        }

        const {
            name,
            price,
            billingPeriod,
        } = req.body;

        let razorpayPlanId =
            oldPlan.razorpayPlanId;

        const changed =
            name !== oldPlan.name ||
            Number(price) !== oldPlan.price ||
            billingPeriod !== oldPlan.billingPeriod;

        /* Razorpay plan cannot truly edit price safely
           so create new plan if changed */
        if (changed) {
            const { period, interval } =
                getRazorpayPeriod(
                    billingPeriod
                );

            const newPlan =
                await razorpay.plans.create({
                    period,
                    interval,
                    item: {
                        name,
                        amount:
                            Math.round(
                                Number(price) * 100
                            ),
                        currency: "INR",
                        description:
                            `${name} Membership`,
                    },
                });

            razorpayPlanId = newPlan.id;
        }

        const plan =
            await Plan.findByIdAndUpdate(
                req.params.id,
                {
                    ...req.body,
                    razorpayPlanId,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        res.json(plan);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to update plan",
        });
    }
};

// DELETE plan
export const deletePlan = async (req, res) => {
    try {
        const plan =
            await Plan.findByIdAndDelete(
                req.params.id
            );

        if (!plan) {
            return res.status(404).json({
                message: "Plan not found",
            });
        }

        /* Razorpay plan usually not deleted.
           Keep for history */

        res.json({
            message:
                "Plan deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Failed to delete plan",
        });
    }
};



// volunteer
/* ─── helpers ─────────────────────────────────────────────────────────── */
const PAGE_LIMIT = 15;

function buildFilter({ status, search, role, contribution }) {
    const q = {};
    if (status && status !== "all") q.status = status;
    if (role && role !== "all") q.role = role;
    if (contribution && contribution !== "all") q.contribution = contribution;
    if (search) {
        const re = new RegExp(search, "i");
        q.$or = [
            { fullName: re },
            { email: re },
            { mobile: re },
            { volunteerId: re },
            { dignitaryName: re },
        ];
    }
    return q;
}

/* ─── GET /admin/volunteers ───────────────────────────────────────────── */
export const getVolunteers = async (req, res) => {
    try {
        const {
            page = 1,
            status,
            search,
            role,
            contribution,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter = buildFilter({ status, search, role, contribution });
        const skip = (Number(page) - 1) * PAGE_LIMIT;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [volunteers, total] = await Promise.all([
            Volunteer.find(filter).sort(sort).skip(skip).limit(PAGE_LIMIT).lean(),
            Volunteer.countDocuments(filter),
        ]);

        res.json({
            volunteers,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / PAGE_LIMIT),
                limit: PAGE_LIMIT,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── GET /admin/volunteers/:id ──────────────────────────────────────── */
export const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id)
            .populate("userId", "name email avatar")
            .lean();
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── PUT /admin/volunteers/:id/approve ──────────────────────────────── */
export const approveVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        if (volunteer.status === "approved")
            return res.status(400).json({ message: "Already approved" });

        await volunteer.approve(); // uses schema method – generates VOL ID
        res.json({ message: "Volunteer approved", volunteer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── PUT /admin/volunteers/:id/dignitary-approve ────────────────────── */
export const dignitaryApprove = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

        volunteer.dignitaryApprovedAt = new Date();
        await volunteer.save();

        res.json({ message: "Dignitary approved", volunteer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── PUT /admin/volunteers/:id/reject ───────────────────────────────── */
export const rejectVolunteer = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason?.trim()) return res.status(400).json({ message: "Rejection reason is required" });

        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        if (volunteer.status === "rejected")
            return res.status(400).json({ message: "Already rejected" });

        volunteer.status = "rejected";
        volunteer.rejectedReason = reason.trim();
        await volunteer.save();

        res.json({ message: "Volunteer rejected", volunteer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── PUT /admin/volunteers/:id/reset ────────────────────────────────── */
export const resetVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

        volunteer.status = "pending";
        volunteer.rejectedReason = undefined;
        volunteer.adminApprovedAt = undefined;
        volunteer.dignitaryApprovedAt = undefined;
        volunteer.volunteerId = null;
        await volunteer.save();

        res.json({ message: "Volunteer reset to pending", volunteer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── DELETE /admin/volunteers/:id ───────────────────────────────────── */
export const deleteVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.json({ message: "Volunteer deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── GET /admin/volunteers/stats ────────────────────────────────────── */
export const getVolunteerStats = async (req, res) => {
    try {
        const [total, pending, approved, rejected] = await Promise.all([
            Volunteer.countDocuments(),
            Volunteer.countDocuments({ status: "pending" }),
            Volunteer.countDocuments({ status: "approved" }),
            Volunteer.countDocuments({ status: "rejected" }),
        ]);
        res.json({ total, pending, approved, rejected });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const exportVolunteers = async (req, res) => {
    try {
        const {
            format = "xlsx",   // "xlsx" | "csv"
            status = "all",
            from,              // ISO date string e.g. "2025-01-01"
            to,                // ISO date string e.g. "2025-05-08"
        } = req.query;

        // ── Build filter ──────────────────────────────────────────────────
        const filter = {};
        if (status && status !== "all") filter.status = status;

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }

        // ── Fetch all matching (no pagination) ────────────────────────────
        const volunteers = await Volunteer.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        if (!volunteers.length) {
            return res.status(404).json({ message: "No volunteers found for the selected filters" });
        }

        // ── Build rows ────────────────────────────────────────────────────
        const rows = volunteers.map((v, idx) => ({
            "#": idx + 1,
            "Volunteer ID": v.volunteerId || "—",
            "Full Name": v.fullName || "",
            "Email": v.email || "",
            "Mobile": v.mobile || "",
            "Gender": v.gender || "",
            "Occupation": v.occupation || "",
            "Address": v.address || "",
            "City": v.city || "",
            "State": v.state || "",
            "Country": v.country || "",
            "Pincode": v.pincode || "",
            "Role": v.role || "",
            "Role Description": v.roleDesc || "",
            "Contribution": v.contribution || "",
            "Dignitary Code": v.dignitaryCode || "",
            "Dignitary Name": v.dignitaryName || "",
            "Status": v.status || "",
            "Dignitary Approved At": v.dignitaryApprovedAt
                ? new Date(v.dignitaryApprovedAt).toLocaleDateString("en-IN")
                : "—",
            "Admin Approved At": v.adminApprovedAt
                ? new Date(v.adminApprovedAt).toLocaleDateString("en-IN")
                : "—",
            "Rejected Reason": v.rejectedReason || "",
            "Applied On": new Date(v.createdAt).toLocaleDateString("en-IN"),
        }));

        const columns = Object.keys(rows[0]);
        const filename = `volunteers_${status}_${Date.now()}`;

        // ── CSV ───────────────────────────────────────────────────────────
        if (format === "csv") {
            const header = columns.join(",");
            const lines = rows.map(row =>
                columns.map(col => {
                    const val = String(row[col] ?? "").replace(/"/g, '""');
                    return val.includes(",") || val.includes('"') || val.includes("\n")
                        ? `"${val}"`
                        : val;
                }).join(",")
            );
            const csv = [header, ...lines].join("\n");

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
            return res.send(csv);
        }

        // ── XLSX ──────────────────────────────────────────────────────────
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Admin Panel";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Volunteers");

        // Header row styling
        sheet.columns = columns.map(col => ({
            header: col,
            key: col,
            width: Math.max(col.length + 4, 16),
        }));

        const headerRow = sheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a1a1a" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                bottom: { style: "thin", color: { argb: "FF444444" } },
            };
        });
        headerRow.height = 24;

        // Data rows
        rows.forEach((row, i) => {
            const excelRow = sheet.addRow(row);
            excelRow.height = 20;
            excelRow.eachCell(cell => {
                cell.alignment = { vertical: "middle" };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF" },
                };
            });

            // Colour the status cell
            const statusCell = excelRow.getCell("Status");
            const statusColors = {
                approved: { bg: "FFD1FAE5", font: "FF065F46" },
                pending: { bg: "FFFEF3C7", font: "FF92400E" },
                rejected: { bg: "FFFEE2E2", font: "FF991B1B" },
            };
            const sc = statusColors[row["Status"]];
            if (sc) {
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sc.bg } };
                statusCell.font = { bold: true, color: { argb: sc.font } };
            }
        });

        // Freeze header + auto-filter
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };

        // Summary sheet
        const summary = workbook.addWorksheet("Summary");
        summary.getColumn(1).width = 24;
        summary.getColumn(2).width = 16;

        const addSummaryRow = (label, value, bold = false) => {
            const row = summary.addRow([label, value]);
            if (bold) row.font = { bold: true };
        };

        addSummaryRow("Export date", new Date().toLocaleDateString("en-IN"), true);
        addSummaryRow("Status filter", status === "all" ? "All statuses" : status);
        addSummaryRow("Date from", from || "All time");
        addSummaryRow("Date to", to || "All time");
        addSummaryRow("Total records", volunteers.length, true);
        summary.addRow([]);
        addSummaryRow("Approved", volunteers.filter(v => v.status === "approved").length);
        addSummaryRow("Pending", volunteers.filter(v => v.status === "pending").length);
        addSummaryRow("Rejected", volunteers.filter(v => v.status === "rejected").length);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (err) {
        console.error("exportVolunteers:", err);
        return res.status(500).json({ message: "Export failed", error: err.message });
    }
};

export const getExportCount = async (req, res) => {
    try {
        const { status = "all", from, to } = req.query;
        const filter = {};
        if (status !== "all") filter.status = status;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }
        const count = await Volunteer.countDocuments(filter);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};






// dignitary
export const getAllDignitaries = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 15,
            search = "",
            status = "all",
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const query = {};

        if (status !== "all") query.status = status;

        if (search.trim()) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { dignitaryId: { $regex: search, $options: "i" } },
                { dignitaryName: { $regex: search, $options: "i" } },
                { placeCity: { $regex: search, $options: "i" } },
                { placeState: { $regex: search, $options: "i" } },
            ];
        }

        const allowedSort = [
            "createdAt",
            "fullName",
            "dignitaryName",
            "placeType",
            "role",
            "status",
        ];

        const sortField = allowedSort.includes(sortBy)
            ? sortBy
            : "createdAt";

        const sort = {
            [sortField]: sortOrder === "asc" ? 1 : -1,
        };

        const total = await Dignitary.countDocuments(query);

        const dignitaries = await Dignitary.find(query)
            .select(
                "fullName email dignitaryId dignitaryName placeType role placeCity placeState status createdAt"
            )
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        res.json({
            dignitaries,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* GET STATS */
export const getDignitaryStats = async (req, res) => {
    try {
        const [total, pending, approved, rejected] =
            await Promise.all([
                Dignitary.countDocuments(),
                Dignitary.countDocuments({ status: "pending" }),
                Dignitary.countDocuments({ status: "approved" }),
                Dignitary.countDocuments({ status: "rejected" }),
            ]);

        res.json({
            total,
            pending,
            approved,
            rejected,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* GET SINGLE */
export const getDignitaryById = async (req, res) => {
    try {
        const dignitary = await Dignitary.findById(req.params.id)
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email")
            .lean();

        if (!dignitary) {
            return res.status(404).json({
                message: "Dignitary not found",
            });
        }

        res.json(dignitary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* APPROVE */
export const approveDignitary = async (req, res) => {
    try {
        const dignitary = await Dignitary.findById(req.params.id);

        if (!dignitary) {
            return res.status(404).json({
                message: "Dignitary not found",
            });
        }

        if (!dignitary.dignitaryId) {
            dignitary.dignitaryId =
                await Dignitary.generateDignitaryId();
        }

        dignitary.status = "approved";
        dignitary.approvedAt = new Date();
        dignitary.rejectedAt = null;
        dignitary.rejectedReason = null;
        dignitary.rejectedBy = null;
        dignitary.approvedBy = req.user?._id || null;

        await dignitary.save();

        const fresh = await Dignitary.findById(dignitary._id)
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email");

        res.json({
            message: "Dignitary approved successfully",
            dignitary: fresh,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* REJECT */
export const rejectDignitary = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason?.trim()) {
            return res.status(400).json({
                message: "Reason is required",
            });
        }

        const dignitary = await Dignitary.findById(req.params.id);

        if (!dignitary) {
            return res.status(404).json({
                message: "Dignitary not found",
            });
        }

        dignitary.status = "rejected";
        dignitary.rejectedAt = new Date();
        dignitary.rejectedReason = reason.trim();
        dignitary.rejectedBy = req.user?._id || null;

        await dignitary.save();

        const fresh = await Dignitary.findById(dignitary._id)
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email");

        res.json({
            message: "Dignitary rejected successfully",
            dignitary: fresh,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* RESET */
export const resetDignitary = async (req, res) => {
    try {
        const dignitary = await Dignitary.findById(req.params.id);

        if (!dignitary) {
            return res.status(404).json({
                message: "Dignitary not found",
            });
        }

        dignitary.status = "pending";
        dignitary.approvedAt = null;
        dignitary.rejectedAt = null;
        dignitary.rejectedReason = null;
        dignitary.approvedBy = null;
        dignitary.rejectedBy = null;

        await dignitary.save();

        res.json({
            message: "Dignitary reset to pending",
            dignitary,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* DELETE */
export const deleteDignitary = async (req, res) => {
    try {
        const dignitary = await Dignitary.findByIdAndDelete(
            req.params.id
        );

        if (!dignitary) {
            return res.status(404).json({
                message: "Dignitary not found",
            });
        }

        res.json({
            message: "Dignitary deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ─── GET /admin/dignitaries/export/count ────────────────────────────── */
export const getDignitaryExportCount = async (req, res) => {
    try {
        const { status = "all", from, to } = req.query;
        const filter = {};
        if (status !== "all") filter.status = status;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }
        const count = await Dignitary.countDocuments(filter);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── GET /admin/dignitaries/export ─────────────────────────────────── */
export const exportDignitaries = async (req, res) => {
    try {
        const { format = "xlsx", status = "all", from, to } = req.query;

        const filter = {};
        if (status !== "all") filter.status = status;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }

        const dignitaries = await Dignitary.find(filter)
            .sort({ createdAt: -1 })
            .populate("approvedBy", "name email")
            .populate("rejectedBy", "name email")
            .lean();

        if (!dignitaries.length)
            return res.status(404).json({ message: "No dignitaries found for the selected filters" });

        const rows = dignitaries.map((d, idx) => ({
            "#": idx + 1,
            "Dignitary ID": d.dignitaryId || "—",
            "Full Name": d.fullName || "",
            "Email": d.email || "",
            "Mobile": d.mobile || "",
            "Gender": d.gender || "",
            "Personal City": d.city || "",
            "Personal State": d.state || "",
            "Personal Country": d.country || "",
            "Personal Pincode": d.pincode || "",
            "Dignitary Name": d.dignitaryName || "",
            "Role": d.role || "",
            "Place Type": d.placeType || "",
            "Full Address": d.fullAddress || "",
            "Place City": d.placeCity || "",
            "Place State": d.placeState || "",
            "Place Country": d.placeCountry || "",
            "Place Pincode": d.placePincode || "",
            "Status": d.status || "",
            "Approved By": d.approvedBy?.name || d.approvedBy?.email || "",
            "Approved At": d.approvedAt ? new Date(d.approvedAt).toLocaleDateString("en-IN") : "—",
            "Rejected By": d.rejectedBy?.name || d.rejectedBy?.email || "",
            "Rejected At": d.rejectedAt ? new Date(d.rejectedAt).toLocaleDateString("en-IN") : "—",
            "Rejected Reason": d.rejectedReason || "",
            "Applied On": new Date(d.createdAt).toLocaleDateString("en-IN"),
        }));

        const columns = Object.keys(rows[0]);
        const filename = `dignitaries_${status}_${Date.now()}`;

        /* ── CSV ── */
        if (format === "csv") {
            const header = columns.join(",");
            const lines = rows.map(row =>
                columns.map(col => {
                    const val = String(row[col] ?? "").replace(/"/g, '""');
                    return val.includes(",") || val.includes('"') || val.includes("\n") ? `"${val}"` : val;
                }).join(",")
            );
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
            return res.send([header, ...lines].join("\n"));
        }

        /* ── XLSX ── */
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Admin Panel";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Dignitaries");

        sheet.columns = columns.map(col => ({
            header: col,
            key: col,
            width: Math.max(col.length + 4, 16),
        }));

        // header row styling
        const headerRow = sheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a1a1a" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = { bottom: { style: "thin", color: { argb: "FF444444" } } };
        });
        headerRow.height = 24;

        // data rows
        rows.forEach((row, i) => {
            const excelRow = sheet.addRow(row);
            excelRow.height = 20;
            excelRow.eachCell(cell => {
                cell.alignment = { vertical: "middle" };
                cell.fill = {
                    type: "pattern", pattern: "solid",
                    fgColor: { argb: i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF" },
                };
            });

            // colour status cell
            const statusCell = excelRow.getCell("Status");
            const statusColors = {
                approved: { bg: "FFD1FAE5", font: "FF065F46" },
                pending: { bg: "FFFEF3C7", font: "FF92400E" },
                rejected: { bg: "FFFEE2E2", font: "FF991B1B" },
            };
            const sc = statusColors[row["Status"]];
            if (sc) {
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sc.bg } };
                statusCell.font = { bold: true, color: { argb: sc.font } };
            }
        });

        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };

        // summary sheet
        const summary = workbook.addWorksheet("Summary");
        summary.getColumn(1).width = 24;
        summary.getColumn(2).width = 16;
        const addRow = (label, value, bold = false) => {
            const r = summary.addRow([label, value]);
            if (bold) r.font = { bold: true };
        };
        addRow("Export date", new Date().toLocaleDateString("en-IN"), true);
        addRow("Status filter", status === "all" ? "All statuses" : status);
        addRow("Date from", from || "All time");
        addRow("Date to", to || "All time");
        addRow("Total records", dignitaries.length, true);
        summary.addRow([]);
        addRow("Approved", dignitaries.filter(d => d.status === "approved").length);
        addRow("Pending", dignitaries.filter(d => d.status === "pending").length);
        addRow("Rejected", dignitaries.filter(d => d.status === "rejected").length);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
        await workbook.xlsx.write(res);
        return res.end();

    } catch (err) {
        console.error("exportDignitaries:", err);
        res.status(500).json({ message: "Export failed", error: err.message });
    }
};








// donations

/* ─── Helper: Build Filter ───────────────────────────────────────────── */
const buildFilterForDonation = ({ status, mode, search }) => {
    const filter = {};

    if (status && status !== "all") {
        filter.status = status;
    }

    if (mode && mode !== "all") {
        filter.mode = mode;
    }

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { purpose: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { donationId: { $regex: search, $options: "i" } },
        ];
    }

    return filter;
};

/* ─── Get All Donations ──────────────────────────────────────────────── */
export const getDonations = async (req, res) => {
    try {
        const {
            page = 1,
            status,
            mode,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter = buildFilterForDonation({ status, mode, search });
        const skip = (Number(page) - 1) * PAGE_LIMIT;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [donations, total] = await Promise.all([
            Donation.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(PAGE_LIMIT)
                .lean(),
            Donation.countDocuments(filter),
        ]);

        res.json({
            donations,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / PAGE_LIMIT),
                limit: PAGE_LIMIT,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Get Donation Stats ─────────────────────────────────────────────── */
export const getDonationStats = async (req, res) => {
    try {
        const [
            total,
            pending,
            paid,
            failed,
            onlineCount,
            offlineCount,
            totalAmountResult,
        ] = await Promise.all([
            Donation.countDocuments(),
            Donation.countDocuments({ status: "pending" }),
            Donation.countDocuments({ status: "paid" }),
            Donation.countDocuments({ status: "failed" }),
            Donation.countDocuments({ mode: "online" }),
            Donation.countDocuments({ mode: "offline" }),
            Donation.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
        ]);

        res.json({
            total,
            pending,
            paid,
            failed,
            onlineCount,
            offlineCount,
            totalAmount: totalAmountResult[0]?.total || 0,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Get Single Donation ────────────────────────────────────────────── */
export const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate("user", "name email")
            .populate("payment")
            .populate("verifiedBy", "name email");

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.json(donation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Verify Offline Donation ────────────────────────────────────────── */
export const verifyDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Only offline donations can be manually verified
        if (donation.mode !== "offline") {
            return res.status(400).json({
                message: "Only offline donations can be manually verified",
            });
        }

        // Only verify if not already paid
        if (donation.status === "paid") {
            return res.status(400).json({
                message: "Donation is already verified as paid",
            });
        }

        // Update donation status
        donation.status = "paid";
        donation.paidAt = new Date();
        donation.verifiedBy = req.user._id; // Assuming auth middleware sets req.user
        donation.verifiedAt = new Date();

        if (notes) {
            donation.notes = notes;
        }

        await donation.save();

        // Populate for response
        await donation.populate("verifiedBy", "name email");

        res.json({
            message: "Offline donation verified successfully",
            donation,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Cancel Donation ────────────────────────────────────────────────── */
export const cancelDonation = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Only offline donations can be cancelled
        if (donation.mode !== "offline") {
            return res.status(400).json({
                message: "Only offline donations can be cancelled. Online donations are managed through payment gateway.",
            });
        }

        // Can only cancel pending or created donations
        if (!["pending", "created"].includes(donation.status)) {
            return res.status(400).json({
                message: `Cannot cancel donation with status: ${donation.status}`,
            });
        }

        donation.status = "cancelled";
        await donation.save();

        res.json({
            message: "Donation cancelled successfully",
            donation,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Delete Donation ────────────────────────────────────────────────── */
export const deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Optional: Add restrictions on what can be deleted
        // For example, don't allow deleting paid donations
        if (donation.status === "paid") {
            return res.status(400).json({
                message: "Cannot delete paid donations. Please contact support.",
            });
        }

        await Donation.findByIdAndDelete(id);

        // Optional: Also delete associated payment record if exists
        if (donation.payment) {
            await Payment.findByIdAndDelete(donation.payment);
        }

        res.json({
            message: "Donation deleted successfully",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Create Donation (for reference) ────────────────────────────────── */
export const createDonation = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            mode,
            amount,
            currency = "INR",
            purpose,
            message,
            offlineReference,
        } = req.body;

        // Validation
        if (!fullName || !email || !amount || !mode) {
            return res.status(400).json({
                message: "Missing required fields: fullName, email, amount, mode",
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                message: "Amount must be at least ₹1",
            });
        }

        if (!["online", "offline"].includes(mode)) {
            return res.status(400).json({
                message: "Mode must be either 'online' or 'offline'",
            });
        }

        // Create donation
        const donation = new Donation({
            user: req.user?._id || null, // Optional logged-in user
            fullName,
            email,
            phone,
            mode,
            amount,
            currency,
            purpose,
            message,
            offlineReference: mode === "offline" ? offlineReference : "",
            status: mode === "offline" ? "pending" : "created",
        });

        await donation.save();

        // If online, you would create Razorpay order here
        // and link the payment record

        res.status(201).json({
            message: "Donation created successfully",
            donation,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Update Donation (Admin) ────────────────────────────────────────── */
export const updateDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating certain fields
        delete updates._id;
        delete updates.createdAt;
        delete updates.user;
        delete updates.payment;

        const donation = await Donation.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.json({
            message: "Donation updated successfully",
            donation,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── Get Donations by User ──────────────────────────────────────────── */
export const getUserDonations = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const skip = (Number(page) - 1) * PAGE_LIMIT;
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const [donations, total] = await Promise.all([
            Donation.find({ user: userId })
                .sort(sort)
                .skip(skip)
                .limit(PAGE_LIMIT)
                .populate("payment")
                .lean(),
            Donation.countDocuments({ user: userId }),
        ]);

        res.json({
            donations,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / PAGE_LIMIT),
                limit: PAGE_LIMIT,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── GET /admin/donations/export/count ──────────────────────────────── */
export const getDonationExportCount = async (req, res) => {
    try {
        const { status = "all", mode = "all", from, to } = req.query;
        const filter = {};
        if (status !== "all") filter.status = status;
        if (mode !== "all") filter.mode = mode;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }
        const count = await Donation.countDocuments(filter);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ─── GET /admin/donations/export ────────────────────────────────────── */
export const exportDonations = async (req, res) => {
    try {
        const { format = "xlsx", status = "all", mode = "all", from, to } = req.query;

        const filter = {};
        if (status !== "all") filter.status = status;
        if (mode !== "all") filter.mode = mode;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }

        const donations = await Donation.find(filter)
            .sort({ createdAt: -1 })
            .populate("verifiedBy", "name email")
            .populate("payment", "razorpayOrderId razorpayPaymentId")
            .lean();

        if (!donations.length)
            return res.status(404).json({ message: "No donations found for the selected filters" });

        const rows = donations.map((d, idx) => ({
            "#": idx + 1,
            "Donation ID": d.donationId || "—",
            "Full Name": d.fullName || "",
            "Email": d.email || "",
            "Phone": d.phone || "",
            "Amount (INR)": d.amount ?? "",
            "Currency": d.currency || "INR",
            "Mode": d.mode || "",
            "Purpose": d.purpose || "",
            "Message": d.message || "",
            "Admin Notes": d.notes || "",
            "Offline Reference": d.offlineReference || "",
            "Status": d.status || "",
            "Paid At": d.paidAt ? new Date(d.paidAt).toLocaleDateString("en-IN") : "—",
            "Verified By": d.verifiedBy?.name || d.verifiedBy?.email || "",
            "Verified At": d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString("en-IN") : "—",
            "Razorpay Order ID": d.payment?.razorpayOrderId || "",
            "Razorpay Payment ID": d.payment?.razorpayPaymentId || "",
            "Created At": new Date(d.createdAt).toLocaleDateString("en-IN"),
        }));

        const columns = Object.keys(rows[0]);
        const filename = `donations_${status}_${Date.now()}`;

        /* ── CSV ── */
        if (format === "csv") {
            const header = columns.join(",");
            const lines = rows.map(row =>
                columns.map(col => {
                    const val = String(row[col] ?? "").replace(/"/g, '""');
                    return val.includes(",") || val.includes('"') || val.includes("\n")
                        ? `"${val}"` : val;
                }).join(",")
            );
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
            return res.send([header, ...lines].join("\n"));
        }

        /* ── XLSX ── */
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Admin Panel";
        workbook.created = new Date();

        const sheet = workbook.addWorksheet("Donations");

        sheet.columns = columns.map(col => ({
            header: col,
            key: col,
            width: Math.max(col.length + 4, 16),
        }));

        // header row styling
        const headerRow = sheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a1a1a" } };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = { bottom: { style: "thin", color: { argb: "FF444444" } } };
        });
        headerRow.height = 24;

        // data rows
        rows.forEach((row, i) => {
            const excelRow = sheet.addRow(row);
            excelRow.height = 20;
            excelRow.eachCell(cell => {
                cell.alignment = { vertical: "middle" };
                cell.fill = {
                    type: "pattern", pattern: "solid",
                    fgColor: { argb: i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF" },
                };
            });

            // colour status cell
            const statusCell = excelRow.getCell("Status");
            const statusColors = {
                paid: { bg: "FFD1FAE5", font: "FF065F46" },
                pending: { bg: "FFFEF3C7", font: "FF92400E" },
                failed: { bg: "FFFEE2E2", font: "FF991B1B" },
                cancelled: { bg: "FFFDE8D8", font: "FF9A3412" },
                created: { bg: "FFF3F4F6", font: "FF374151" },
            };
            const sc = statusColors[row["Status"]];
            if (sc) {
                statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: sc.bg } };
                statusCell.font = { bold: true, color: { argb: sc.font } };
            }

            // colour mode cell
            const modeCell = excelRow.getCell("Mode");
            const modeColors = {
                online: { bg: "FFDBEAFE", font: "FF1E40AF" },
                offline: { bg: "FFEDE9FE", font: "FF5B21B6" },
            };
            const mc = modeColors[row["Mode"]];
            if (mc) {
                modeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: mc.bg } };
                modeCell.font = { bold: true, color: { argb: mc.font } };
            }
        });

        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };

        // summary sheet
        const summary = workbook.addWorksheet("Summary");
        summary.getColumn(1).width = 24;
        summary.getColumn(2).width = 20;
        const addRow = (label, value, bold = false) => {
            const r = summary.addRow([label, value]);
            if (bold) r.font = { bold: true };
        };
        addRow("Export date", new Date().toLocaleDateString("en-IN"), true);
        addRow("Status filter", status === "all" ? "All statuses" : status);
        addRow("Mode filter", mode === "all" ? "All modes" : mode);
        addRow("Date from", from || "All time");
        addRow("Date to", to || "All time");
        addRow("Total records", donations.length, true);
        summary.addRow([]);
        const totalAmount = donations.reduce((s, d) => s + (d.amount || 0), 0);
        addRow("Total amount (INR)", totalAmount, true);
        summary.addRow([]);
        addRow("Paid", donations.filter(d => d.status === "paid").length);
        addRow("Pending", donations.filter(d => d.status === "pending").length);
        addRow("Failed", donations.filter(d => d.status === "failed").length);
        addRow("Cancelled", donations.filter(d => d.status === "cancelled").length);
        addRow("Created", donations.filter(d => d.status === "created").length);
        summary.addRow([]);
        addRow("Online", donations.filter(d => d.mode === "online").length);
        addRow("Offline", donations.filter(d => d.mode === "offline").length);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
        await workbook.xlsx.write(res);
        return res.end();

    } catch (err) {
        console.error("exportDonations:", err);
        res.status(500).json({ message: "Export failed", error: err.message });
    }
};







// subscriptions
export const getAllSubscriptions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 15,
            status,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = {};

        if (status && status !== "all") {
            query.status = status;
        }

        /* search user */
        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                ],
            }).select("_id");

            query.user = { $in: users.map(u => u._id) };
        }

        const subscriptions = await Subscription.find(query)
            .populate("user", "name email phone")
            .populate("plan", "name price billingPeriod")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Subscription.countDocuments(query);

        res.json({
            subscriptions,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSubscriptionStats = async (req, res) => {
    try {
        /* 🔥 SUBSCRIPTION STATS */
        const subStats = await Subscription.aggregate([
            {
                $group: {
                    _id: null,
                    totalSubscriptions: { $sum: 1 },

                    active: {
                        $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    },
                    failed: {
                        $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
                    },
                    expired: {
                        $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] }
                    },
                }
            }
        ]);

        /* 🔥 PAYMENT STATS (REVENUE ONLY) */
        const paymentStats = await Payment.aggregate([
            {
                $match: {
                    status: "paid",
                    type: "membership", // 🔥 IMPORTANT
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalPayments: { $sum: 1 }
                }
            }
        ]);

        const sub = subStats[0] || {};
        const pay = paymentStats[0] || {};

        res.json({
            totalSubscriptions: sub.totalSubscriptions || 0,

            activeSubscriptions: sub.active || 0,
            cancelledSubscriptions: sub.cancelled || 0,
            failedSubscriptions: sub.failed || 0,
            expiredSubscriptions: sub.expired || 0,

            totalPayments: pay.totalPayments || 0, // now only membership payments
            totalRevenue: (pay.totalRevenue || 0) / 100,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate("user", "name email phone")
            .populate("plan");

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
            });
        }

        /* 🔥 ALL PAYMENTS FOR THIS SUBSCRIPTION */
        const payments = await Payment.find({
            subscription: subscription._id,
        }).sort({ createdAt: -1 });

        res.json({
            subscription,
            payments,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
            });
        }

        if (subscription.status !== "active") {
            return res.status(400).json({
                message: "Only active subscriptions can be cancelled",
            });
        }

        /* expire check */
        if (
            subscription.endDate &&
            dayjs(subscription.endDate).isBefore(dayjs())
        ) {
            return res.status(400).json({
                message: "Subscription already expired",
            });
        }

        /* 🔥 Razorpay cancel */
        if (subscription.razorpaySubscriptionId) {
            await razorpay.subscriptions.cancel(
                subscription.razorpaySubscriptionId,
                true
            );
        }

        subscription.status = "cancelled";
        subscription.cancelledAt = dayjs().toDate();
        subscription.endDate = dayjs().toDate();

        await subscription.save();

        res.json({
            message: "Subscription cancelled successfully",
            subscription,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};






// users
export const getUserStats = async (req, res) => {
    try {
        const [
            total,
            active,
            inactive,
            phoneVerified,
            phoneUnverified
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: false }),
            User.countDocuments({ isPhoneVerified: true }),
            User.countDocuments({ isPhoneVerified: false }),
        ]);

        /* 🔥 TODAY START (00:00) */
        const todayStart = dayjs().startOf("day").toDate();

        const newToday = await User.countDocuments({
            createdAt: { $gte: todayStart },
        });

        /* 🔥 MONTH START */
        const monthStart = dayjs().startOf("month").toDate();

        const newThisMonth = await User.countDocuments({
            createdAt: { $gte: monthStart },
        });

        res.json({
            total,
            active,
            inactive,
            phoneVerified,
            phoneUnverified,
            newToday,
            newThisMonth,
        });

    } catch (err) {
        console.error("getUserStats:", err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 15,
            search,
            role,
            isActive,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter = {};

        // search
        if (search) {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { name: regex },
                { email: regex },
                { phone: regex },
                { clientId: regex },
            ];
        }

        // role filter
        if (role && ["donator", "volunteer", "dignitary"].includes(role)) {
            filter.role = role;
        }

        // active filter
        if (isActive !== undefined && isActive !== "") {
            filter.isActive = isActive === "true";
        }

        // sort
        const allowedSort = ["createdAt", "name", "role", "lastLoginAt", "isActive"];
        const sort = {};
        sort[allowedSort.includes(sortBy) ? sortBy : "createdAt"] =
            sortOrder === "asc" ? 1 : -1;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-otp -otpExpireAt -otpCooldownUntil -otpAttempts")
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(filter),
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum,
            },
        });
    } catch (err) {
        console.error("getUsers:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch all in parallel
        const [user, volunteer, dignitary, donations, payments, subscriptions] =
            await Promise.all([
                User.findById(id)
                    .select("-otp -otpExpireAt -otpCooldownUntil -otpAttempts")
                    .lean(),

                Volunteer.findOne({ userId: id }).lean(),

                Dignitary.findOne({ userId: id }).lean(),

                Donation.find({ user: id })
                    .sort({ createdAt: -1 })
                    .lean(),

                Payment.find({ user: id })
                    .sort({ createdAt: -1 })
                    .lean(),

                Subscription.find({ user: id })
                    .populate("plan", "name price billingPeriod billingLabel badge")
                    .sort({ createdAt: -1 })
                    .lean(),
            ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user,
            subscriptions,
            volunteer,
            dignitary,
            donations,
            payments,
        });
    } catch (err) {
        console.error("getUserDetail:", err);
        res.status(500).json({ message: "Failed to fetch user detail" });
    }
};

export const toggleUserActive = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("isActive name");
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();

        res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
    } catch (err) {
        console.error("toggleUserActive:", err);
        res.status(500).json({ message: "Failed to update user" });
    }
};

// Clears an automatic OTP abuse-lock (hourly/daily send cap or too many
// wrong OTP attempts) for a user. Different from toggleUserActive, which is
// a full manual account block/unblock — this only resets the OTP throttling
// state, for cases like a legit user tripping the rate limit.
export const resetUserOtpBlock = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select(
            "name otpBlockedUntil otpSendCountHour otpSendHourStart otpSendCountDay otpSendDayStart otpAttempts"
        );
        if (!user) return res.status(404).json({ message: "User not found" });

        user.otpBlockedUntil = null;
        user.otpAttempts = 0;
        user.otpSendCountHour = 0;
        user.otpSendHourStart = null;
        user.otpSendCountDay = 0;
        user.otpSendDayStart = null;
        await user.save();

        res.json({ message: "OTP restrictions cleared for user" });
    } catch (err) {
        console.error("resetUserOtpBlock:", err);
        res.status(500).json({ message: "Failed to reset OTP restrictions" });
    }
};


/* ─── helpers ────────────────────────────────────────────────────── */
const adminName = (req) =>
    req.user?.name || req.user?.email || "Admin";

const log = (action, req, detail = "") => ({
    action,
    by: req.user?._id || null,
    byName: adminName(req),
    detail,
    at: new Date(),
});

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC
═══════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════
   ADMIN — LIST & STATS
═══════════════════════════════════════════════════════════════════ */

/**
 * GET /api/admin/contacts
 * Query: page, status, queryType, search, sortBy, sortOrder
 */
export const getContacts = async (req, res) => {
    try {
        const {
            page = 1,
            status = "all",
            queryType = "all",
            search = "",
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const LIMIT = 15;
        const skip = (Number(page) - 1) * LIMIT;

        /* build filter */
        const filter = { isDeleted: false };
        if (status !== "all") filter.status = status;
        if (queryType !== "all") filter.queryType = queryType;
        if (search.trim()) {
            const re = new RegExp(search.trim(), "i");
            filter.$or = [{ name: re }, { email: re }, { phone: re }, { subject: re }];
        }

        const sortDir = sortOrder === "asc" ? 1 : -1;
        const allowedSort = ["createdAt", "name", "status", "queryType", "resolvedAt"];
        const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";

        const [contacts, total] = await Promise.all([
            Contact.find(filter)
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(LIMIT)
                .populate("assignedTo", "name email")
                .populate("resolvedBy", "name email")
                .lean(),
            Contact.countDocuments(filter),
        ]);

        return res.json({
            contacts,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / LIMIT),
            },
        });
    } catch (err) {
        console.error("getContacts error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/admin/contacts/stats
 */
export const getContactStats = async (req, res) => {
    try {
        const base = { isDeleted: false };

        const [total, open, in_progress, resolved, closed, byType] = await Promise.all([
            Contact.countDocuments(base),
            Contact.countDocuments({ ...base, status: "open" }),
            Contact.countDocuments({ ...base, status: "in_progress" }),
            Contact.countDocuments({ ...base, status: "resolved" }),
            Contact.countDocuments({ ...base, status: "closed" }),
            Contact.aggregate([
                { $match: base },
                { $group: { _id: "$queryType", count: { $sum: 1 } } },
            ]),
        ]);

        const typeMap = {};
        byType.forEach((t) => (typeMap[t._id] = t.count));

        return res.json({
            total,
            open,
            in_progress,
            resolved,
            closed,
            byType: typeMap,
        });
    } catch (err) {
        console.error("getContactStats error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/admin/contacts/:id
 */
export const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findOne({
            _id: req.params.id,
            isDeleted: false,
        })
            .populate("assignedTo", "name email")
            .populate("resolvedBy", "name email")
            .populate("closedBy", "name email")
            .populate("activityLog.by", "name email");

        if (!contact)
            return res.status(404).json({ message: "Contact not found" });

        return res.json(contact);
    } catch (err) {
        console.error("getContactById error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/* ═══════════════════════════════════════════════════════════════════
   ADMIN — ACTIONS
═══════════════════════════════════════════════════════════════════ */

/**
 * PUT /api/admin/contacts/:id/status
 * Body: { status: "open" | "in_progress" | "resolved" | "closed", notes? }
 */
export const updateStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const allowed = ["open", "in_progress", "resolved", "closed"];
        if (!allowed.includes(status))
            return res.status(400).json({ message: "Invalid status value" });

        const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
        if (!contact) return res.status(404).json({ message: "Contact not found" });

        const prev = contact.status;
        contact.status = status;

        if (status === "resolved") {
            contact.resolvedBy = req.user._id;
            contact.resolvedAt = new Date();
        }
        if (status === "closed") {
            contact.closedBy = req.user._id;
            contact.closedAt = new Date();
        }
        // reopen resets resolution fields
        if (status === "open" || status === "in_progress") {
            contact.resolvedBy = null;
            contact.resolvedAt = null;
            contact.closedBy = null;
            contact.closedAt = null;
        }

        contact.activityLog.push(
            log("status_changed", req, `Status changed from ${prev} → ${status}${notes ? ` | Note: ${notes}` : ""}`)
        );
        if (notes) contact.adminNotes = notes;

        await contact.save();

        return res.json({
            message: `Status updated to ${status}`,
            contact,
        });
    } catch (err) {
        console.error("updateStatus error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PUT /api/admin/contacts/:id/assign
 * Body: { adminId }
 */
export const assignContact = async (req, res) => {
    try {
        const { adminId } = req.body;
        const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
        if (!contact) return res.status(404).json({ message: "Contact not found" });

        contact.assignedTo = adminId || null;
        const detail = adminId
            ? `Assigned to admin ID: ${adminId}`
            : "Unassigned";

        contact.activityLog.push(log("assigned", req, detail));
        await contact.save();

        const populated = await contact.populate("assignedTo", "name email");
        return res.json({ message: "Contact assigned", contact: populated });
    } catch (err) {
        console.error("assignContact error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * PUT /api/admin/contacts/:id/notes
 * Body: { notes }
 */
export const updateNotes = async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes?.trim())
            return res.status(400).json({ message: "Notes cannot be empty" });

        const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
        if (!contact) return res.status(404).json({ message: "Contact not found" });

        contact.adminNotes = notes.trim();
        contact.activityLog.push(log("note_added", req, notes.trim()));
        await contact.save();

        return res.json({ message: "Notes saved", contact });
    } catch (err) {
        console.error("updateNotes error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * DELETE /api/admin/contacts/:id
 * Soft delete
 */
export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, isDeleted: false });
        if (!contact) return res.status(404).json({ message: "Contact not found" });

        contact.isDeleted = true;
        contact.deletedAt = new Date();
        contact.deletedBy = req.user._id;
        contact.activityLog.push(log("deleted", req, "Contact soft-deleted"));
        await contact.save();

        return res.json({ message: "Contact deleted" });
    } catch (err) {
        console.error("deleteContact error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};



// dashboard
const currentMonthRange = () => {
    const now = new Date();
    return {
        start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)),
    };
};

/**
 * Returns { start, end } for the previous calendar month.
 */
const lastMonthRange = () => {
    const now = new Date();
    return {
        start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
        end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999)),
    };
};

/**
 * Safely compute percent change between two values.
 * Returns rounded integer or 0.
 */
const pctChange = (current, previous) => {
    if (!previous) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

/**
 * Build a day-by-day series for the last N days.
 * `records` is an array of { _id: "YYYY-MM-DD", count: Number }.
 */
const buildDailySeries = (records, days = 7, key = "count") => {
    const map = Object.fromEntries(records.map(r => [r._id, r.count]));
    const series = [];

    for (let i = days - 1; i >= 0; i--) {
        const d = dayjs().tz(TZ).subtract(i, "day");

        const dateKey = d.format("YYYY-MM-DD");   // ✅ matches Mongo
        const label = d.format("ddd");            // Mon, Tue

        series.push({
            day: label,
            [key]: map[dateKey] ?? 0
        });
    }

    return series;
};

/**
 * Build a month-by-month series for the last N months.
 * `records` is an array of { _id: "YYYY-MM", count: Number }.
 */
const buildMonthlySeries = (records, months = 6, key = "count") => {
    const map = Object.fromEntries(records.map(r => [r._id, r.count]));
    const series = [];

    for (let i = months - 1; i >= 0; i--) {
        const d = dayjs().tz(TZ).subtract(i, "month");

        const monthKey = d.format("YYYY-MM");   // ✅ matches Mongo
        const label = d.format("MMM YY");       // Jan 24

        series.push({
            month: label,
            [key]: map[monthKey] ?? 0
        });
    }

    return series;
};

// ─── Controller ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard/stats
 * Returns all data needed by DashboardPage in one shot.
 */
export const getDashboardStats = async (req, res) => {
    try {
        const { start: thisStart, end: thisEnd } = currentMonthRange();
        const { start: lastStart, end: lastEnd } = lastMonthRange();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        // ── Run everything in parallel ─────────────────────────────────────

        const [
            // totals
            totalUsers,
            totalContacts,
            totalVolunteers,
            totalDignitaries,
            totalAdmins,
            totalPayments,

            // current-month counts
            usersThisMonth,
            contactsThisMonth,
            volunteersThisMonth,
            dignitariesThisMonth,
            paymentsThisMonth,

            // last-month counts
            usersLastMonth,
            contactsLastMonth,
            volunteersLastMonth,
            dignitariesLastMonth,
            paymentsLastMonth,

            // sub-statuses
            verifiedUsers,
            volunteersApproved,
            volunteersPending,
            volunteersRejected,
            dignitariesApproved,
            dignitariesPending,
            dignitariesRejected,
            verifiedAdmins,
            activeSubscriptions,
            totalSubscriptions,

            // donations
            donationAggTotal,
            donationThisMonth,
            donationLastMonth,

            // chart series
            usersByDayRaw,
            contactsByDayRaw,
            donationsByDayRaw,
            volunteersByMonthRaw,

            // recent records
            recentUsers,
            recentContacts,
            recentVolunteers,
            recentDonations,
        ] = await Promise.all([

            // ── Totals ──
            User.countDocuments({ isActive: true }),
            Contact.countDocuments({ isDeleted: false }),
            Volunteer.countDocuments(),
            Dignitary.countDocuments(),
            Admin.countDocuments(),
            Payment.countDocuments(),

            // ── This month ──
            User.countDocuments({ createdAt: { $gte: thisStart, $lte: thisEnd } }),
            Contact.countDocuments({ isDeleted: false, createdAt: { $gte: thisStart, $lte: thisEnd } }),
            Volunteer.countDocuments({ createdAt: { $gte: thisStart, $lte: thisEnd } }),
            Dignitary.countDocuments({ createdAt: { $gte: thisStart, $lte: thisEnd } }),
            Payment.countDocuments({ createdAt: { $gte: thisStart, $lte: thisEnd } }),

            // ── Last month ──
            User.countDocuments({ createdAt: { $gte: lastStart, $lte: lastEnd } }),
            Contact.countDocuments({ isDeleted: false, createdAt: { $gte: lastStart, $lte: lastEnd } }),
            Volunteer.countDocuments({ createdAt: { $gte: lastStart, $lte: lastEnd } }),
            Dignitary.countDocuments({ createdAt: { $gte: lastStart, $lte: lastEnd } }),
            Payment.countDocuments({ createdAt: { $gte: lastStart, $lte: lastEnd } }),

            // ── Sub-statuses ──
            User.countDocuments({ isPhoneVerified: true }),
            Volunteer.countDocuments({ status: "approved" }),
            Volunteer.countDocuments({ status: "pending" }),
            Volunteer.countDocuments({ status: "rejected" }),
            Dignitary.countDocuments({ status: "approved" }),
            Dignitary.countDocuments({ status: "pending" }),
            Dignitary.countDocuments({ status: "rejected" }),
            Admin.countDocuments({ isUserVerify: true }),
            Subscription.countDocuments({ status: "active" }),
            Subscription.countDocuments(),

            // ── Donation aggregations ──
            Donation.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Donation.aggregate([
                { $match: { status: "paid", paidAt: { $gte: thisStart, $lte: thisEnd } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Donation.aggregate([
                { $match: { status: "paid", paidAt: { $gte: lastStart, $lte: lastEnd } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),

            // ── Chart: new users last 7 days ──
            User.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // ── Chart: contacts last 7 days ──
            Contact.aggregate([
                { $match: { isDeleted: false, createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // ── Chart: donations last 7 days ──
            Donation.aggregate([
                { $match: { status: "paid", paidAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: "Asia/Kolkata" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // ── Chart: volunteers last 6 months ──
            Volunteer.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "Asia/Kolkata" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: -1 } },
                { $limit: 6 },
            ]),

            // ── Recent records ──
            User.find().sort({ createdAt: -1 }).limit(5).select("name email phone isPhoneVerified createdAt"),
            Contact.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select("name phone subject queryType status createdAt"),
            Volunteer.find().sort({ createdAt: -1 }).limit(5).select("fullName mobile role status volunteerId"),
            Donation.find({ status: "paid" }).sort({ paidAt: -1 }).limit(5).select("fullName amount purpose mode paidAt"),
        ]);

        // ── Derived donation values ────────────────────────────────────────

        const donTotal = donationAggTotal[0] ?? { total: 0, count: 0 };
        const donThisMonth = donationThisMonth[0] ?? { total: 0, count: 0 };
        const donLastMonth = donationLastMonth[0] ?? { total: 0, count: 0 };

        // ── Build chart series ─────────────────────────────────────────────

        const usersByDay = buildDailySeries(usersByDayRaw, 7, "users").map(({ day, users }) => ({ day, users }));
        const contactsByDay = buildDailySeries(contactsByDayRaw, 7, "contacts").map(({ day, contacts }) => ({ day, contacts }));
        const donationsByDay = buildDailySeries(donationsByDayRaw, 7, "donations").map(({ day, donations }) => ({ day, donations }));
        const volunteersByMonth = buildMonthlySeries(volunteersByMonthRaw, 6, "volunteers").map(({ month, volunteers }) => ({ month, volunteers }));

        // helper to rename "count" key produced by buildDailySeries
        function buildDailySeries(records, days, key) {
            const map = Object.fromEntries(records.map((r) => [r._id, r.count]));
            const series = [];
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setUTCDate(d.getUTCDate() - i);
                const dateKey = d.toISOString().slice(0, 10);
                const label = d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
                series.push({ day: label, [key]: map[dateKey] ?? 0 });
            }
            return series;
        }

        function buildMonthlySeries(records, months, key) {
            const map = Object.fromEntries(records.map((r) => [r._id, r.count]));
            const series = [];
            for (let i = months - 1; i >= 0; i--) {
                const d = new Date();
                d.setUTCMonth(d.getUTCMonth() - i);
                const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
                const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });
                series.push({ month: label, [key]: map[monthKey] ?? 0 });
            }
            return series;
        }

        // ── Compose response ───────────────────────────────────────────────

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    users: {
                        total: totalUsers,
                        verified: verifiedUsers,
                        unverified: totalUsers - verifiedUsers,
                        thisMonth: usersThisMonth,
                        lastMonth: usersLastMonth,
                        changePercent: pctChange(usersThisMonth, usersLastMonth),
                    },
                    contacts: {
                        total: totalContacts,
                        thisMonth: contactsThisMonth,
                        lastMonth: contactsLastMonth,
                        changePercent: pctChange(contactsThisMonth, contactsLastMonth),
                    },
                    volunteers: {
                        total: totalVolunteers,
                        approved: volunteersApproved,
                        pending: volunteersPending,
                        rejected: volunteersRejected,
                        thisMonth: volunteersThisMonth,
                        lastMonth: volunteersLastMonth,
                        changePercent: pctChange(volunteersThisMonth, volunteersLastMonth),
                    },
                    dignitaries: {
                        total: totalDignitaries,
                        approved: dignitariesApproved,
                        pending: dignitariesPending,
                        rejected: dignitariesRejected,
                        thisMonth: dignitariesThisMonth,
                        lastMonth: dignitariesLastMonth,
                        changePercent: pctChange(dignitariesThisMonth, dignitariesLastMonth),
                    },
                    admins: {
                        total: totalAdmins,
                        verified: verifiedAdmins,
                    },
                    donations: {
                        total: donTotal.count,
                        totalAmount: donTotal.total,
                        thisMonth: donThisMonth.count,
                        thisMonthAmt: donThisMonth.total,
                        lastMonth: donLastMonth.count,
                        lastMonthAmt: donLastMonth.total,
                        changePercent: pctChange(donThisMonth.total, donLastMonth.total),
                    },
                    subscriptions: {
                        total: totalSubscriptions,
                        active: activeSubscriptions,
                    },
                    payments: {
                        total: totalPayments,
                        thisMonth: paymentsThisMonth,
                        lastMonth: paymentsLastMonth,
                        changePercent: pctChange(paymentsThisMonth, paymentsLastMonth),
                    },
                },

                charts: {
                    usersByDay,
                    contactsByDay,
                    donationsByDay,
                    volunteersByMonth,
                },

                recent: {
                    users: recentUsers,
                    contacts: recentContacts,
                    volunteers: recentVolunteers,
                    donations: recentDonations,
                },
            },
        });
    } catch (error) {
        console.error("[getDashboardStats]", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};