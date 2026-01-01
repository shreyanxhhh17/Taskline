import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";

// -------------------------------
// REGISTER
// -------------------------------
const registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const decision = await aj.protect(req, { email });
    console.log("Arcjet decision:", decision.isDenied());

    if (decision.isDenied()) {
      return res.status(403).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashPassword,
      name,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
    });

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const emailBody = `
      <p>Hello ${name},</p>
      <p>Click <a href="${link}">here</a> to verify your email.</p>
      <p>This link will expire in 12 hours.</p>
    `;

    const sent = await sendEmail(email, "Verify Email", emailBody);

    if (!sent) {
      return res.status(500).json({ message: "Email could not be sent" });
    }

    return res.status(201).json({
      message: "Verification email sent. Please verify your account.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------
// LOGIN
// -------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email & password required" });

    // ❗ FIX: select("+password") because schema hides it
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // remove password before sending user object
    user.password = undefined;

    return res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// -------------------------------
// VERIFY EMAIL
// -------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.purpose !== "email-verification") {
      return res.status(403).json({ message: "Invalid token" });
    }

    const verification = await Verification.findOne({
      userId: payload.userId,
      token,
    });

    if (!verification)
      return res.status(403).json({ message: "Invalid token" });

    if (verification.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token expired" });
    }

    await User.findByIdAndUpdate(payload.userId, {
      isEmailVerified: true,
    });

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------
// RESET PASSWORD REQUEST
// -------------------------------
const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!user.isEmailVerified)
      return res.status(400).json({ message: "Email not verified" });

    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await Verification.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const emailBody = `
      <p>Hello,</p>
      <p>Click <a href="${link}">here</a> to reset your password.</p>
      <p>This link will expire in 15 minutes.</p>
    `;

    const sent = await sendEmail(email, "Reset Password", emailBody);

    if (!sent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    }

    return res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// -------------------------------
// RESET PASSWORD FINAL
// -------------------------------
const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.purpose !== "reset-password")
      return res.status(403).json({ message: "Invalid token" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const verification = await Verification.findOne({
      userId: payload.userId,
      token,
    });

    if (!verification || verification.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token expired" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(payload.userId, {
      password: hashPassword,
    });

    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};
