import express from "express";
import {
    sendOtp,
    verifyOtpLogin,
    getMe,
    logout,
    createVolunteer,
    registerDignitary,
    getPlans,
    createDonation,
    verifyDonation,
    getMyDonations,
    getMyVolunteers,
    getMyDignitaries,
    getMyDignitaryById,
    getProfile,
    updateProfile,
    updateProfileImage,
    joinMembership,
    verifyMembership,
    getMySubscriptions,
    getMyActiveSubscription,
    cancelSubscription,
    getMyPayments,
    submitContact,
} from "../controller/user.controller.js"
import userAuthMiddleware from "../middleware/userAuth.middleware.js";
import { sendOtpIpLimiter, verifyOtpIpLimiter } from "../middleware/otpRateLimiter.js";


const router = express.Router();

/* =========================
   AUTH ROUTES
========================= */
router.post("/auth/send-otp", sendOtpIpLimiter, sendOtp);
router.post("/auth/verify-otp", verifyOtpIpLimiter, verifyOtpLogin);
router.get("/auth/me", userAuthMiddleware, getMe);
router.get("/auth/logout", logout);
router.get("/auth/profile", userAuthMiddleware, getProfile);
router.put("/auth/profile", userAuthMiddleware, updateProfile);
router.put("/auth/profile/image", userAuthMiddleware, updateProfileImage);


// volunteer
router.post("/request-volunteer", userAuthMiddleware, createVolunteer)
router.get("/volunteers/my-volunteers", userAuthMiddleware, getMyVolunteers)


router.post("/register-dignitary", userAuthMiddleware, registerDignitary)
router.get("/dignitaries/my-dignitaries/:id", userAuthMiddleware, getMyDignitaryById)
router.get("/dignitaries/my-dignitaries", userAuthMiddleware, getMyDignitaries)



// plan or memebership 
router.get("/plans", getPlans);

router.post("/payments/create-order", userAuthMiddleware, joinMembership);
router.post("/payments/verify", userAuthMiddleware, verifyMembership);
router.get("/subscriptions/my-subscriptions", userAuthMiddleware, getMySubscriptions);
router.get("/my-subscriptions/active", userAuthMiddleware, getMyActiveSubscription);
router.post("/subscriptions/:id/cancel", userAuthMiddleware, cancelSubscription);

// dontate
router.post("/donation/create", userAuthMiddleware, createDonation);
router.post("/donation/verify", userAuthMiddleware, verifyDonation);
router.get("/donations/my-donations", userAuthMiddleware, getMyDonations);


// payments
router.get("/payments/my-payments", userAuthMiddleware, getMyPayments);


// contact
router.post("/contact", submitContact);


export default router;