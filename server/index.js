import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import { jwtStrategyConfig } from "./config/passport.js";
import routes from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(morgan("dev"));
//app.use(morgan('combined')); Production logging

jwtStrategyConfig(passport);
app.use(passport.initialize());

// Routes
app.use("/api", routes);

// Root route
app.get("/", (req, res) => {
  res.send("Hello from Express with ES Modules!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
