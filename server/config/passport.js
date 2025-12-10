import { Strategy as JwtStrategy } from "passport-jwt";
import prisma from "./prisma.js";

export const jwtStrategyConfig = (passport) => {
  const opts = {
    jwtFromRequest: (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.token;
      }
      return token;
    },
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            activeAccountId: true,
          },
        });

        if (!user) {
          return done(null, false);
        }

        // Set the req.user.accountId to be the current activeAccountId -> allows for multiple accounts per user
        const userWithActiveAccount = {
          ...user,
          accountId: user.activeAccountId,
        };

        return done(null, userWithActiveAccount);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
