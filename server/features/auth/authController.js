import prisma from "../../config/prisma.js";
import { loginSchema } from "./schema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h", // make sure this matches cookie
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      secure: isProduction, // true in prod, false in dev
      sameSite: isProduction ? "strict" : "lax", // strict in prod, lax in dev
      maxAge: 12 * 60 * 60 * 1000, // 12 hours - make sure this matches token
    });

    // Remove password from returned user data - consider returning Person?
    const { password: _, ...safeUser } = user;
    console.log("Auth process passed");
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
