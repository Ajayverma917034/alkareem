// routes/planRoutes.js
import express from "express";
import { approveDignitary, approveVolunteer, assignContact, cancelDonation, cancelSubscription, createPlan, deleteContact, deleteDignitary, deleteDonation, deleteVolunteer, dignitaryApprove, exportDignitaries, exportDonations, exportVolunteers, getAllDignitaries, getAllPlans, getAllSubscriptions, getContactById, getContacts, getContactStats, getDashboardStats, getDignitaryById, getDignitaryExportCount, getDignitaryStats, getDonationById, getDonationExportCount, getDonations, getDonationStats, getExportCount, getSubscriptionById, getSubscriptionStats, getUserDetail, getUsers, getUserStats, getVolunteerById, getVolunteers, getVolunteerStats, LoginAdmin, registerAdmin, rejectDignitary, rejectVolunteer, resetDignitary, resetVolunteer, resetUserOtpBlock, toggleUserActive, updateDonation, updateNotes, updatePlan, updateStatus, verifyDonation, logoutUser, adminForgotPasswordOtp, adminResetPassword, changePassword } from "../controller/admin.controller.js";
import adminAuthMiddleware from "../middleware/adminAuth.middleware.js";


const router = express.Router();

// Public Routes
router.post("/register", registerAdmin)
router.post("/auth/login", LoginAdmin)
router.get("/auth/logout", logoutUser)
router.post("/auth/reset-password-otp", adminForgotPasswordOtp);
router.post("/auth/reset-password", adminResetPassword);
router.put("/auth/change-password", adminAuthMiddleware, changePassword);
// plan
router.post("/plans", adminAuthMiddleware, createPlan);
router.get("/plans/all", adminAuthMiddleware, getAllPlans);
router.put("/plans/:id", adminAuthMiddleware, updatePlan);




// volunteer
router.get("/volunteers/stats", adminAuthMiddleware, getVolunteerStats);
router.get("/volunteers/", adminAuthMiddleware, getVolunteers);
router.get("/volunteers/export", adminAuthMiddleware, exportVolunteers);
router.get("/volunteers/export/count", adminAuthMiddleware, getExportCount);
router.get("/volunteers/:id", adminAuthMiddleware, getVolunteerById);

router.put("/volunteers/:id/approve", adminAuthMiddleware, approveVolunteer);
router.put("/volunteers/:id/dignitary-approve", adminAuthMiddleware, dignitaryApprove);
router.put("/volunteers/:id/reject", adminAuthMiddleware, rejectVolunteer);
router.put("/volunteers/:id/reset", adminAuthMiddleware, resetVolunteer);

router.delete("/volunteers/:id", adminAuthMiddleware, deleteVolunteer);

// dignitary
router.get("/dignitaries", adminAuthMiddleware, getAllDignitaries);
router.get("/dignitaries/stats", adminAuthMiddleware, getDignitaryStats);
router.get("/dignitaries/export/count", adminAuthMiddleware, getDignitaryExportCount);
router.get("/dignitaries/export", adminAuthMiddleware, exportDignitaries);
router.get("/dignitaries/:id", adminAuthMiddleware, getDignitaryById);

router.put("/dignitaries/:id/approve", adminAuthMiddleware, approveDignitary);
router.put("/dignitaries/:id/reject", adminAuthMiddleware, rejectDignitary);
router.put("/dignitaries/:id/reset", adminAuthMiddleware, resetDignitary);

router.delete("/dignitaries/:id", adminAuthMiddleware, deleteDignitary);



// donation
router.get("/donations/", adminAuthMiddleware, getDonations);
router.get("/donations/stats", adminAuthMiddleware, getDonationStats);
router.get("/donations/export/count", adminAuthMiddleware, getDonationExportCount);
router.get("/donations/export", adminAuthMiddleware, exportDonations);
router.get("/donations/:id", adminAuthMiddleware, getDonationById);
router.put("/donations/:id/verify", adminAuthMiddleware, verifyDonation);
router.put("/donations/:id/cancel", adminAuthMiddleware, cancelDonation);
router.put("/donations/:id", adminAuthMiddleware, updateDonation);
router.delete("/donations/:id", adminAuthMiddleware, deleteDonation);



// subscriptions
router.get("/subscriptions/", adminAuthMiddleware, getAllSubscriptions);
router.get("/payments/stats/", adminAuthMiddleware, getSubscriptionStats);
router.get("/subscriptions/:id/", adminAuthMiddleware, getSubscriptionById);
router.put("/subscriptions/:id/", adminAuthMiddleware, cancelSubscription);


// users
router.get("/users/", adminAuthMiddleware, getUsers);
router.get("/users/stats/", adminAuthMiddleware, getUserStats);
router.get("/users/:id/", adminAuthMiddleware, getUserDetail);
router.patch("/users/:id/toggle-active", adminAuthMiddleware, toggleUserActive);
router.patch("/users/:id/reset-otp-block", adminAuthMiddleware, resetUserOtpBlock);



// contacts form data
router.get("/contacts", adminAuthMiddleware, getContacts);
router.get("/contacts/stats", adminAuthMiddleware, getContactStats);
router.get("/contacts/:id", adminAuthMiddleware, getContactById);

router.put("/contacts/:id/status", adminAuthMiddleware, updateStatus);
router.put("/contacts/:id/assign", adminAuthMiddleware, assignContact);
router.put("/contacts/:id/notes", adminAuthMiddleware, updateNotes);

router.delete("/contacts/:id", adminAuthMiddleware, deleteContact);


router.get("/dashboard", adminAuthMiddleware, getDashboardStats);
export default router;