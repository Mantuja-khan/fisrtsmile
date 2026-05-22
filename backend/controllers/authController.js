import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import OTP from "../models/OTP.js";
import jwt from "jsonwebtoken";
import { sendEmail, getEmailTemplate } from "../config/email.js";
import crypto from "crypto";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.isBlocked) {
    res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    return;
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { full_name, email, password, phone, address, city, state, pincode, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    res.status(400).json({ message: "this number already used" });
    return;
  }

  // Check Blacklist
  const blacklisted = await Blacklist.findOne({
    $or: [{ email: normalizedEmail }, { phone: phone }],
  });

  if (blacklisted) {
    res.status(403).json({ message: "This email or phone number is blocked by admin." });
    return;
  }

  // Verify OTP
  const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });
  if (!otpRecord) {
    res.status(400).json({ message: "Invalid or expired OTP" });
    return;
  }
  await OTP.deleteOne({ _id: otpRecord._id });

  const user = await User.create({
    full_name,
    email: normalizedEmail,
    password,
    phone,
    address,
    city,
    state,
    pincode,
  });

  if (user) {
    // Send Welcome Email (Fire and forget asynchronously)
    const welcomeTitle = "Welcome to Toy Haat! 🎉";
    const welcomeText = `Welcome ${full_name} to Toy Haat! Your account has been successfully created. We are excited to help you bring smiles, one toy at a time.`;
    const welcomeHtml = getEmailTemplate(
      welcomeTitle,
      `
            <h1>Welcome to Toy Haat! 🎈</h1>
            <p>Dear <strong>${full_name}</strong>,</p>
            <p>Thank you for joining the <strong>Toy Haat</strong> family! Your account has been successfully created.</p>
            <p>Explore our wide collections of premium, educational, and joyful toys curated just for you.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://toyhaat.com" class="btn">Start Exploring Our Toys</a>
            </div>
            <p>If you have any questions, simply hit reply or reach out on Instagram! We are always happy to assist.</p>
        `,
    );
    sendEmail(normalizedEmail, welcomeTitle, welcomeText, welcomeHtml).catch((err) =>
      console.error("Welcome email failed:", err),
    );

    res.status(201).json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.full_name = req.body.full_name || user.full_name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;
    user.pincode = req.body.pincode || user.pincode;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      pincode: updatedUser.pincode,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json(users);
};

// @desc    Block user (Admin)
// @route   PUT /api/auth/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isBlocked = true;
    await user.save();

    // Add to Blacklist
    await Blacklist.findOneAndUpdate(
      { email: user.email },
      { email: user.email, phone: user.phone },
      { upsert: true },
    );

    res.json({ message: "User blocked and blacklisted" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Unblock user (Admin)
// @route   PUT /api/auth/users/:id/unblock
// @access  Private/Admin
export const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isBlocked = false;
    await user.save();

    // Remove from Blacklist
    await Blacklist.deleteOne({ email: user.email });

    res.json({ message: "User unblocked" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  const { email, type } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (type === "forgot" && !userExists) {
    res.status(404).json({ message: "Email is not registered. Please sign up first." });
    return;
  }

  if (type === "signup" && userExists) {
    res.status(400).json({ message: "Email is already registered. Please login." });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Limit OTP requests (Optional but good practice)
  await OTP.deleteMany({ email: normalizedEmail });
  await OTP.create({ email: normalizedEmail, otp });

  const title = "Verification Code — Toy Haat";
  const text = `Your verification code is: ${otp}. This code is valid for 10 minutes.`;
  const html = getEmailTemplate(
    title,
    `
        <h1>Account Verification</h1>
        <p>Hello there,</p>
        <p>Thank you for choosing <strong>Toy Haat</strong>. To complete your verification, please use the one-time passcode (OTP) below:</p>
        <div class="otp-box">${otp}</div>
        <p>This code is valid for <strong>10 minutes</strong>. For security, please do not share this code with anyone.</p>
    `,
  );

  const emailSent = await sendEmail(normalizedEmail, title, text, html);

  if (emailSent) {
    res.status(200).json({ message: "OTP sent to your email." });
  } else {
    res.status(500).json({ message: "Failed to send OTP. Please check your email address." });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });
  if (!otpRecord) {
    res.status(400).json({ message: "Invalid or expired OTP" });
    return;
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.password = newPassword;
  await user.save();
  await OTP.deleteOne({ _id: otpRecord._id });

  res.json({ message: "Password reset successful. You can now login with your new password." });
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });
  if (!otpRecord) {
    res.status(400).json({ message: "Invalid or expired OTP" });
    return;
  }

  res.json({ message: "OTP verified successfully" });
};

// @desc    Fetch Shiprocket/Fastrr Login Access Token
// @route   POST /api/auth/shiprocket-token
// @access  Public
export const getShiprocketFastrrToken = async (req, res) => {
  try {
    const apiKey = process.env.SHIPROCKET_FASTARR_API_KEY;
    const secretKey = process.env.SHIPROCKET_FASTARR_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.error("⚠️ Shiprocket Fastrr credentials missing in backend/.env!");
      return res.status(500).json({
        message:
          "Shiprocket Fastrr configuration is missing on the server. Please define SHIPROCKET_FASTARR_API_KEY and SHIPROCKET_FASTARR_SECRET_KEY in backend/.env.",
      });
    }

    const currentISOString = new Date().toISOString();
    const requestBody = {
      address: true,
      timestamp: currentISOString,
    };

    const serializedBody = JSON.stringify(requestBody);

    // Generate HMAC SHA256 Base64 hash using secret key
    const hmacHash = crypto.createHmac("sha256", secretKey).update(serializedBody).digest("base64");

    // Send POST request to production Shiprocket Fastrr login access token API
    const response = await fetch("https://checkout-api.shiprocket.com/api/v1/access-token/login", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "X-Api-HMAC-SHA256": hmacHash,
        "Content-Type": "application/json",
      },
      body: serializedBody,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: responseData.message || "Failed to fetch access token from Shiprocket",
        error: responseData,
      });
    }

    return res.json(responseData);
  } catch (error) {
    console.error("Shiprocket Fastrr Token Error:", error);
    return res
      .status(500)
      .json({
        message: "Internal server error while fetching Shiprocket token",
        error: error.message,
      });
  }
};

// @desc    Auto-register / Login user after successful Shiprocket Fastrr OTP Verification
// @route   POST /api/auth/shiprocket-login
// @access  Public
export const shiprocketLogin = async (req, res) => {
  const { phone, authorised_customer_token, address_data } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  try {
    // Standardize phone number format
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("+91")) {
      formattedPhone = formattedPhone.slice(3);
    } else if (formattedPhone.startsWith("91") && formattedPhone.length === 12) {
      formattedPhone = formattedPhone.slice(2);
    }

    // 1. Search for existing user by phone
    let user = await User.findOne({ phone: formattedPhone });

    // 2. Extract address details if present
    const sa = address_data && address_data.shipping_address ? address_data.shipping_address : {};
    const email = sa.email || req.body.email || "";
    const firstName = sa.first_name || "";
    const lastName = sa.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "ToyHaat Customer";

    const fullAddress = [sa.address1, sa.address2].filter(Boolean).join(", ") || "";
    const city = sa.city || "";
    const state = sa.state || "";
    const pincode = sa.zipcode || sa.pincode || "";

    // 3. If user doesn't exist, search by email to link them
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (user) {
      // Check if user is blocked
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ message: "Your account has been blocked. Please contact support." });
      }

      // Update user details with newest verified info from Shiprocket Fastrr
      user.phone = formattedPhone;
      if (fullName && fullName !== "ToyHaat Customer") user.full_name = fullName;
      if (fullAddress) user.address = fullAddress;
      if (city) user.city = city;
      if (state) user.state = state;
      if (pincode) user.pincode = pincode;

      await user.save();
    } else {
      // 4. Create new user
      // We need a random secure password since it's a required field in User schema
      const secureRandomPassword = crypto.randomBytes(16).toString("hex");

      // Fallback email if email is empty or already taken by another account
      let finalEmail = email ? email.toLowerCase().trim() : `${formattedPhone}@toyhaat.fastrr.com`;
      const emailExists = await User.findOne({ email: finalEmail });
      if (emailExists || !finalEmail) {
        finalEmail = `${formattedPhone}@toyhaat.fastrr.com`;
      }

      // Check if this fallback email exists
      const fallbackExists = await User.findOne({ email: finalEmail });
      if (fallbackExists) {
        // If collision still happens (rare), append timestamp
        finalEmail = `${formattedPhone}-${Date.now()}@toyhaat.fastrr.com`;
      }

      // Create user
      user = await User.create({
        full_name: fullName,
        email: finalEmail,
        phone: formattedPhone,
        password: secureRandomPassword,
        address: fullAddress,
        city,
        state,
        pincode,
      });
    }

    // Return user info and our local application JWT token
    return res.status(200).json({
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Shiprocket Fastrr Auto-Login Error:", error);
    return res
      .status(500)
      .json({ message: "Error authenticating user via Shiprocket", error: error.message });
  }
};
