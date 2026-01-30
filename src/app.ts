import express from "express";
import { type Response, type Request, type NextFunction } from "express";
import { query } from "./database/mysql";
import cookieParser from "cookie-parser";

import { errorHandler } from "./utils/errorHandler";
// ---------Routes------------------------------------------------------------------------
import authRouter from "./routes/auth.routes";
import otpRouter from "./routes/otp.routes";
import carouselRouter from "./routes/carousel.routes"
import categoryRouter from "./routes/category.routes";
// ------------------------------------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(cookieParser()); 
app.get("/", (_, res: Response) => {
  res.send("<h1>Express Server running with TypeScript!</h1>");
});

app.get("/db/health", async (_, res: Response) => {
  const data = await query("SELECT * FROM USERS WHERE USER_ID = ?", [1]);
  return res.json(data);
});

declare global {
  namespace Express {
    interface Request {
      users: {
        SESSION_ID: number;
        USER_ID: number;
        EMAIL: string | null;
        PHONE: string | null;
        IS_PHONE_VERIFIED: number;
        IS_EMAIL_VERIFIED: number;
        ROLE: string;
      };
    }
  }
}

app.use("/users", authRouter);
app.use("/otp", otpRouter);
app.use('/carousel',carouselRouter)
app.use("/category", categoryRouter);

app.use(errorHandler);

export default app;
