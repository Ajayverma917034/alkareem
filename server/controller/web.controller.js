import Dignitary from "../schema/dignitary.schema.js";
import Donation from "../schema/donation.schema.js";
import Expense from "../schema/expense.schema.js";
import Volunteer from "../schema/volunteer.schema.js";
import dayjs from "dayjs";
export const getVolunteers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            status = "",
            role = "",
            gender = "",
            city = "",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        /* ---- Build Filter ---- */
        const filter = {
            status: "approved"
        };

        // if (status) filter.status = status;
        // if (role) filter.role = { $regex: role, $options: "i" };
        // if (gender) filter.gender = gender;
        // if (city) filter.city = { $regex: city, $options: "i" };

        if (search.trim()) {
            filter.$or = [
                { volunteerId: { $regex: search.trim(), $options: "i" } },
                { fullName: { $regex: search.trim(), $options: "i" } },
                { mobile: { $regex: search.trim(), $options: "i" } },
            ];
        }

        /* ---- Query ---- */
        const [volunteers, totalDocs] = await Promise.all([
            Volunteer.find(filter)
                .select(
                    "volunteerId city state role status adminApprovedAt"
                )
                .sort({ adminApprovedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Volunteer.countDocuments(filter),
        ]);

        /* ---- Stats (always on full collection, no filter) ---- */
        const [total, approved, pending, rejected] = await Promise.all([
            Volunteer.countDocuments(),
            Volunteer.countDocuments({ status: "approved" }),
            Volunteer.countDocuments({ status: "pending" }),
            Volunteer.countDocuments({ status: "rejected" }),
        ]);

        return res.status(200).json({
            success: true,
            stats: { total, approved, pending, rejected },
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalDocs / limitNum),
                totalDocs,
                limit: limitNum,
            },
            volunteers,
        });
    } catch (err) {
        console.error("getVolunteers error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
};

/* ===============================
   GET /api/volunteers/:id
   Public — get single volunteer by volunteerId
================================= */
export const getVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({
            volunteerId: req.params.id,
        })
            .select("-documents -userId")
            .lean();

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found.",
            });
        }

        return res.status(200).json({ success: true, volunteer });
    } catch (err) {
        console.error("getVolunteerById error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
};


export const searchDignitaries = async (req, res) => {
    try {
        const { q = "" } = req.query;

        const trimmed = q.trim();

        if (!trimmed || trimmed.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Query must be at least 2 characters long.",
            });
        }

        const regex = new RegExp(trimmed, "i");

        const dignitaries = await Dignitary.find({
            status: "approved", // only approved dignitaries
            $or: [
                { dignitaryName: regex },
                { dignitaryId: regex },
            ],
        })
            .select(
                "_id dignitaryId dignitaryName placeType placeCity placeState placeCountry role"
            )
            .limit(10)
            .lean();

        return res.status(200).json({
            success: true,
            count: dignitaries.length,
            dignitaries,
        });
    } catch (error) {
        console.error("searchDignitaries error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while searching dignitaries.",
        });
    }
};

export const getDonationSummary = async (req, res) => {
    try {
        const now = dayjs();
        const todayStart = now.startOf("day").toDate();
        const monthStart = now.startOf("month").toDate();

        const [all, month, today] = await Promise.all([
            Donation.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Donation.aggregate([
                { $match: { status: "paid", paidAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
            Donation.aggregate([
                { $match: { status: "paid", paidAt: { $gte: todayStart } } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                allTime: { amount: all[0]?.total || 0, count: all[0]?.count || 0 },
                thisMonth: { amount: month[0]?.total || 0, count: month[0]?.count || 0 },
                today: { amount: today[0]?.total || 0, count: today[0]?.count || 0 },
            },
        });
    } catch (error) {
        console.error("getDonationSummary error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch donation summary"
        });
    }
};

/**
 * GET /api/web/expenses/total
 * Public endpoint - Total expenses for transparency
 */
export const getTotalExpenses = async (req, res) => {
    try {
        const [result] = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalAmount: result?.totalAmount || 0,
                totalCount: result?.count || 0,
            },
        });
    } catch (error) {
        console.error("getTotalExpenses error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch expense total"
        });
    }
};

export const getDonationList = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate = "",
            endDate = "",
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build date filter
        const filter = {
            status: "paid" // Only show approved/completed donations
        };

        // Date range filter
        if (startDate && endDate) {
            const start = dayjs(startDate).startOf("day").toDate();
            const end = dayjs(endDate).endOf("day").toDate();

            if (start && end && start <= end) {
                filter.paidAt = { $gte: start, $lte: end };
            }
        } else if (startDate) {
            const start = dayjs(startDate).startOf("day").toDate();
            filter.paidAt = { $gte: start };
        } else if (endDate) {
            const end = dayjs(endDate).endOf("day").toDate();
            filter.paidAt = { $lte: end };
        }

        // Query donations with population
        const [donations, totalDocs] = await Promise.all([
            Donation.find(filter)
                .select(
                    "donationId fullName email phone amount purpose status paidAt mode createdAt"
                )
                .sort({ paidAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Donation.countDocuments(filter),
        ]);

        // Format donations for response
        const formattedDonations = donations.map(donation => ({
            donationId: donation.donationId || `DON${String(donation._id).slice(-6).toUpperCase()}`,
            donorName: donation.fullName,
            amount: donation.amount,
            purpose: donation.purpose || "General Support",
            category: getCategoryFromPurpose(donation.purpose),
            date: donation.paidAt || donation.createdAt,
            paymentMethod: donation.mode === "online" ? getPaymentMethod(donation) : "Offline",
            status: donation.status === "paid" ? "Completed" : donation.status,
        }));

        return res.status(200).json({
            success: true,
            data: {
                donations: formattedDonations,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalDocs / limitNum),
                    totalDocs,
                    limit: limitNum,
                },
            },
        });
    } catch (error) {
        console.error("getDonationList error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch donation list",
        });
    }
};

// Helper function to determine category based on purpose
function getCategoryFromPurpose(purpose) {
    if (!purpose) return "General";
    const purposeLower = purpose.toLowerCase();
    if (purposeLower.includes("education")) return "Education";
    if (purposeLower.includes("health") || purposeLower.includes("healthcare")) return "Health";
    if (purposeLower.includes("women")) return "Women";
    if (purposeLower.includes("child")) return "Child Welfare";
    return "General";
}

// Helper function to get payment method
function getPaymentMethod(donation) {
    // This can be enhanced based on your actual payment data structure
    // For now, return a default or derive from other fields
    return "Online Transfer";
}