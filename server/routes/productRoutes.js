import express from "express";
import {getProducts, createProduct, getProductById, updateProduct, deleteProduct} from "../controllers/productController.js";


const router = express.Router();
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);


export default router;