import Counter from "../schema/counter.schmea.js";

export const generateDonationId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { name: "donation" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const number = counter.seq.toString().padStart(5, "0");
    return `DON${number}`;
}

export const getNextSequence = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return counter.seq;
};