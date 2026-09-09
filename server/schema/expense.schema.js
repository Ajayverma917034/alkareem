import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
    {

        /* Amount */
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
        currency: {
            type: String,
            default: "INR",
        },
        /* Admin who added */
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
            index: true,
        },
        /* Expense details */
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["food", "travel", "event", "office", "other"],
            default: "other",
            index: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        /* Date of expense */
        expenseDate: {
            type: Date,
            default: Date.now,
            index: true,
        },
        /* Payment mode */
        paymentMode: {
            type: String,
            enum: ["cash", "upi", "bank"],
            default: "cash",
        },
        /* Optional bill/proof */
        documents: [
            {
                url: String,
                publicId: String,
                fileName: String,
                fileType: String,
                fileSize: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);
const Expense = mongoose.model("Expense", expenseSchema);
export default Expense