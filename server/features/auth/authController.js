import prisma from "../../config/prisma.js";
import { loginSchema } from "./schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function loginUser(req, res) {
  const requestData = req.body;

  const validated = loginSchema.safeParse(requestData);

  if (!validated.success) {
    console.log(validated.error);
    return res.status(400).json(validated.error);
  }

  // Get validated data
  const { email, password } = validated.data;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      include: { accounts: true },
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Handle account selection based on available accounts
    let activeAccountId;
    let requiresAccountSelection = false;

    if (user.accounts.length === 0) {
      // Edge case: User has no accounts (shouldn't happen but good to handle)
      return res.status(403).json({
        error: "No accounts associated with this user",
      });
    } else if (user.accounts.length === 1) {
      // Single account - set it automatically
      activeAccountId = user.accounts[0].id;
    } else {
      // Multiple accounts - require selection
      activeAccountId = null;
      requiresAccountSelection = true;
    }

    // Step 3 - Update the user's activeAccountId
    await prisma.user.update({
      where: { id: user.id },
      data: { activeAccountId },
    });

    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h", // make sure this matches cookie
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,

      secure: isProduction, // true in prod, false in dev
      sameSite: isProduction ? "strict" : "lax", // strict in prod, lax in dev
      maxAge: 12 * 60 * 60 * 1000, // 12 hours - make sure this matches token
    });

    // Remove password from returned user data - consider returning Person?
    const { password: _, ...safeUser } = user;

    // If user has multiple accounts they need to select activeAccountId for this session
    // Send back flag to prompt selection
    if (requiresAccountSelection) {
      return res.status(200).json({
        user: safeUser,
        requiresAccountSelection: true,
      });
    }

    // Standard return when no account selection required
    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
}

// Validates submitted cookie via middleware
// Used by front end on page refresh to check token still valid
export async function validateAuth(req, res) {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "No valid authentication token provided",
    });
  }

  res.json({ user: req.user });
}

// Sends reset password link if valid email provided
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findFirst({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour is more user-friendly
        },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      // TO DO - EMAIL SENDING
      // await sendPasswordResetEmail(user.email, resetUrl);

      console.log(resetUrl);
    }

    // Always return same response (prevent email enumeration)
    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

// Re-sets a forgotten password
export async function resetPassword(req, res) {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    // Hash the incoming token to match what's stored in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this hashed token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: password, // TO DO - HASH PASSWORD!!
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      },
    });

    return res.status(200).json({
      message: "Password successfully reset",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

// Upadates an existing password for authenticated user
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current password and new password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password (with bcrypt)
    // const isPasswordValid = await bcrypt.compare(
    //   currentPassword,
    //   user.password
    // );

    const isPasswordValid = user.password === currentPassword;

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    //const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: newPassword, // Store hashed version
      },
    });

    return res.status(200).json({
      message: "Password successfully updated",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

export async function getAccountOptions(req, res) {
  const user = req.user;

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        accounts: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      accounts: userData.accounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

export async function setAccountOption(req, res) {
  const user = req.user;
  const { accountId } = req.body;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { activeAccountId: accountId },
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      accounts: userData.accounts,
    });
  } catch (error) {
    console.error(error);

    // Handle not found
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}
