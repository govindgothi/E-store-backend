import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const createJwtToken = (payload: { SESSION_ID: number ,ROLE:string}) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: 7 * 24 * 60 * 60 * 1000,
  });

