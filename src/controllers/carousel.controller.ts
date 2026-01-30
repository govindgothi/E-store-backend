import { Request,Response,NextFunction } from "express"
import { CustomError } from "../utils/errorHandler"
import { CreateCarouselPayload } from "../types/carousel.type"
import { createCarouselService } from "../services/carousel.service"
import { FileType } from "../types/constant.types"

export const createCarousel = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const payload:CreateCarouselPayload = req.body
        console.log(payload,req.body)
        const FILE_PATH : FileType[] | undefined = req?.files
        const result = await createCarouselService({...payload,FILE_PATH})
        
    } catch (error:any) {
        return res.status(500).json(new CustomError("Internal server error",500,error.message))
    }
}
export const getCarousels = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        
    } catch (error:any) {
        return res.status(500).json(new CustomError("Internal server error",500,error.message))
    }
}
export const getCarouselById = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        
    } catch (error:any) {
        return res.status(500).json(new CustomError("Internal server error",500,error.message))
    }
}
export const updateCarousel = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        
    } catch (error:any) {
        return res.status(500).json(new CustomError("Internal server error",500,error.message))
    }
}
export const deleteCarousel = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        
    } catch (error:any) {
        return res.status(500).json(new CustomError("Internal server error",500,error.message))
    }
}
