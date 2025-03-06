import express from 'express';
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRouters from "./routes/userRouters.js";
import {defence} from "./arcjet/arcjetFunc.js";
import {authenticateJWT} from "./middlewares/authenticateJWT.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors())
app.use(helmet()); //for protected http headers
app.use(morgan("dev")); //log the requests
/*arcjet settings*/
app.use(defence)
app.use("/api/product", productRoutes)
app.use("/api/", userRouters)



async function start(){
    try{
        await db.connect( ()=>{
            console.log("Database Connected");
        })
        await app.listen(PORT, ()=>{
            console.log("Server running on port: " + PORT);
        });
    }catch (e){
        console.error( e);
    }
}



start().then()