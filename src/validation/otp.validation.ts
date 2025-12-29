import * as z from "zod";

export const ValidateOtp = z
  .object({
    OTP_PLATFORM: z.enum(["PHONE", "EMAIL"], {
      message: "login type can be phone or email",
    }),
    OTP_TYPE: z.enum(["SIGNUP", "FORGET_PASSWORD", "ORDER","DELETE","LOGIN"], {
      message: "OTP type can be SIGNUP, FORGET_PASSWORD, ORDER, DELETE, LOGIN",
    }),
    EMAIL: z
      .string()
      .email({ message: "Invalid email format" })
      .optional()
      .or(z.literal("")),
    PHONE: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.OTP_PLATFORM === "EMAIL") {
        return data.EMAIL && data.EMAIL.trim() !== "";
      }
      return true;
    },
    {
      message: "EMAIL is required",
      path: ["EMAIL"],
    }
  )
  .refine(
    (data) => {
      if (data.OTP_PLATFORM === "PHONE") {
        return data.PHONE && data.PHONE.trim() !== "";
      }
      return true;
    },
    {
      message: "PHONE is required",
      path: ["PHONE"],
    }
  );

  

export type ValidateOtpType = z.infer<typeof ValidateOtp>;
