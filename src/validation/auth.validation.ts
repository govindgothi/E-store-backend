import * as z from "zod";

export const ValidateUser = z
  .object({
    REGISTER_TYPE: z.enum(["PHONE", "EMAIL"], {
      message: "login type can be phone or email ",
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
    PASSWORD: z
      .string({ message: "Password must be a string value" })
      .trim()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        }
      ),
    NAME: z
      .string({ message: "Name must be string value" })
      .trim()
      .min(3, { message: "Name length must be greater than 3 characters" })
      .max(20, { message: "Name length must be less than 20 characters" }),
    OTP: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
    ROLE: z.enum(["CUSTOMER"], {
      message: "Role must be CUSTOMER",
    }),
  })
  .refine(
    (data) => {
      if (data.REGISTER_TYPE === "EMAIL") {
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
      if (data.REGISTER_TYPE === "PHONE") {
        return data.PHONE && data.PHONE.trim() !== "";
      }
      return true;
    },
    {
      message: "PHONE is required",
      path: ["PHONE"],
    }
  );

export const LoginInputValidation = z
  .object({
    LOGIN_TYPE: z.enum(["PHONE", "EMAIL"], {
      message: "Login type must be PHONE or EMAIL",
    }),

    IS_OTP_TYPE: z.boolean().optional(),

    EMAIL: z.string().email("Invalid email format").optional(),

    PHONE: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .optional(),

    PASSWORD: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number & special character"
      )
      .optional(),

    OTP: z
      .string()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
      .optional(),
  })
  .superRefine((data, ctx) => {
    /* ================= EMAIL LOGIN ================= */
    if (data.LOGIN_TYPE === "EMAIL") {
      if (!data.EMAIL) {
        ctx.addIssue({
          path: ["EMAIL"],
          message: "EMAIL is required for email login",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.PASSWORD) {
        ctx.addIssue({
          path: ["PASSWORD"],
          message: "PASSWORD is required for email login",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* ================= PHONE LOGIN ================= */
    if (data.LOGIN_TYPE === "PHONE") {
      if (!data.PHONE) {
        ctx.addIssue({
          path: ["PHONE"],
          message: "PHONE is required for phone login",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.IS_OTP_TYPE) {
        // OTP login
        if (!data.OTP) {
          ctx.addIssue({
            path: ["OTP"],
            message: "OTP is required when IS_OTP_TYPE is true",
            code: z.ZodIssueCode.custom,
          });
        }
      } else {
        // Password login
        if (!data.PASSWORD) {
          ctx.addIssue({
            path: ["PASSWORD"],
            message: "PASSWORD is required when IS_OTP_TYPE is false",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    }
  });

export const ValidateForgetPasswordInpput = z
  .object({
    OTP_PLATFORM: z.enum(["PHONE", "EMAIL"], {
      message: "login type can be phone or email ",
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
    PASSWORD: z
      .string({ message: "Password must be a string value" })
      .trim()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        }
      ),
      CONFIRM_PASSWORD: z
      .string({ message: "Password must be a string value" })
      .trim()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
        }
      ),
    OTP: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
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

export type UserValidationType = z.infer<typeof ValidateUser>;
