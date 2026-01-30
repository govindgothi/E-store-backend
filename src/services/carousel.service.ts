import { CreateCarouselPayload } from "../types/carousel.type";
import { CustomError } from "../utils/errorHandler";
import { ValidateCarouselPayload } from "../validation/carousel.validation";

export const createCarouselService = (payload:CreateCarouselPayload) =>{
 const {CAROUSEL_TITLE,	CAROUSEL_DESCRIPTION, FILE_PATH} = payload

    const result = ValidateCarouselPayload.safeParse({
        CAROUSEL_DESCRIPTION,
        CAROUSEL_TITLE
    })
    console.log("file",FILE_PATH)
   if (!result.success) {
     console.log(result);
     let obj: Record<string, string> = {};
     result.error.issues.forEach((data) => {
       const key = String(data.path?.[0] ?? "unknown");
       obj[key] = data.message;
     });
     return new CustomError("Input value is not matched", 404, obj);
   }
  console.log("ok")


}
