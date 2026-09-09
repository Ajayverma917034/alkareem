import { getDonationList, getDonationSummary, getTotalExpenses, getVolunteers, searchDignitaries } from "../controller/web.controller.js";
import express from 'express'
const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */
router.get("/volunteers", getVolunteers);
router.get("/dignitaries/search", searchDignitaries);
router.get("/donations/summary", getDonationSummary);
router.get("/expenses/total", getTotalExpenses);
router.get("/donations/list", getDonationList);

export default router