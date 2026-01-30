import { FileType } from "./constant.types"

export interface CreateCarouselPayload {	
    CAROUSEL_TITLE:string,
    CAROUSEL_DESCRIPTION:string
    FILE_PATH:FileType[] | undefined
}