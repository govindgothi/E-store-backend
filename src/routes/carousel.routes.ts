import { Router } from "express";
import { createCarousel, deleteCarousel, getCarouselById, getCarousels, updateCarousel } from "../controllers/carousel.controller";
import { uploadFields } from "../utils/multer.util";

const router  =  Router()

router.get('/',getCarousels)
router.get('/:CAROUSEL_ID',getCarouselById)
router.post('/', uploadFields, createCarousel)
router.put('/:CAROUSEL_ID',uploadFields,updateCarousel)
router.delete('/:CAROUSEL_ID',deleteCarousel)


export default router



