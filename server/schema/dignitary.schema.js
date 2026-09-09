import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
        fileSize: Number,
    },
    { _id: false }
);

const dignitarySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        dignitaryId: {
            type: String,
            unique: true,
            sparse: true,
            default: null,
            index: true,
        },

        fullName: String,
        email: String,
        mobile: String,
        gender: String,

        pincode: String,
        city: String,
        state: String,
        country: String,

        dignitaryName: {
            type: String,
            required: true,
            trim: true,
        },

        placeType: {
            type: String,
            required: true,
            trim: true,
        },

        fullAddress: {
            type: String,
            required: true,
            trim: true,
        },

        placePincode: String,
        placeCity: String,
        placeState: String,
        placeCountry: String,

        role: {
            type: String,
            required: true,
            trim: true,
        },

        documents: [documentSchema],

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },

        approvedAt: Date,
        rejectedAt: Date,
        rejectedReason: String,

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

/* Generate ID */
dignitarySchema.statics.generateDignitaryId = async function () {
    const year = new Date().getFullYear();

    const last = await this.findOne({
        dignitaryId: new RegExp(`^DGN-${year}-`)
    }).sort({ dignitaryId: -1 });

    let next = 1;

    if (last?.dignitaryId) {
        const parts = last.dignitaryId.split("-");
        next = Number(parts[2]) + 1;
    }

    return `DGN-${year}-${String(next).padStart(4, "0")}`;
};

const Dignitary = mongoose.model("Dignitary", dignitarySchema);
export default Dignitary;