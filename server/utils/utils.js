import dayjs from "dayjs";

export const normalizeDate = (date, end = false) => {
    if (!date) return null;

    return end
        ? dayjs(date).endOf("day").toDate()
        : dayjs(date).startOf("day").toDate();
};

export const normalizeDateTime = (date) => {
    return date ? dayjs(date).toDate() : null;
};