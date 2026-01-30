import * as z from "zod";
const DescriptionCarousel = z
  .string({ message: "Description must be string" })
  .min(15, "Description must be min 15 characters long")
  .max(30, "Description must be max 30 characters long");
const TitleCarousel = z
  .string({ message: "Title must be string" })
  .min(15, "Title must be min 15 characters long")
  .max(30, "Title must be max 30 characters long");

export const ValidateCarouselPayload = z.object({
  CAROUSEL_DESCRIPTION: DescriptionCarousel,
  CAROUSEL_TITLE: TitleCarousel,
});
