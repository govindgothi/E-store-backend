import crypto, { verify } from "node:crypto";
import { CustomError } from "./errorHandler";

interface payload {
  sessionId: number;
  expiry: Date;
}

const mySceretkey = process.env.JWT_SECRET || "range-long";
export const createSignToken = (payload: string): string => {
  const signature = crypto
    .createHash("sha256")
    .update(mySceretkey)
    .update(payload)
    .update(mySceretkey)
    .digest("hex");
  return signature;
};
// Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export const verifySignToken = (payload: string) => {
  let [one,two,three, orgSignature] = payload.split(".");
   let token = `${one}.${two}.${three}`
  if (!token) {
    return {isValid:false,token};
  }
  const signature = createSignToken(token);
  if (signature === orgSignature) {
    return {isValid:true,token};
  }else{
    return {isValid:true,token};
  }
};
