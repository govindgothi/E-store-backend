import * as z from "zod";

export const UserIdSchema = z.number({
  message: "Invalid user id format",
});

export const CategoryIdSchema = z.number({
  message: "Invalid category id format",
});

export const CategoryNameSchema = z
  .string({ message: "Category must be string" })
  .min(5, "Category must be min 5 characters long")
  .max(50, "Category must be max 50 characters long");

export const CategoryDescriptionSchema = z
  .string({ message: "Category description must be string" })
  .min(5, "Category must be min 5 characters long")
  .max(250, "Category must be max 250 characters long");


  export const ValidateCategoryPayload = z.object({
  USER_ID: UserIdSchema,
  CATEGORY_NAME: CategoryNameSchema,
  CATEGORY_DESCRIPTION: CategoryDescriptionSchema,
});
  export const ValidateUpdateCategoryPayload =
  ValidateCategoryPayload.partial().extend({
    USER_ID: UserIdSchema, // keep required
    CATEGORY_ID: CategoryIdSchema,
  });

