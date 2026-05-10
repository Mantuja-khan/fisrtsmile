import express from 'express';
const router = express.Router();
import { authUser, registerUser, getUserProfile, updateUserProfile, getUsers, blockUser, unblockUser, sendOTP, resetPassword, verifyOTP } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id/block').put(protect, admin, blockUser);
router.route('/users/:id/unblock').put(protect, admin, unblockUser);

export default router;
