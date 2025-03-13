import jwt from "jsonwebtoken";
import {adminEmailRegExp} from "../regExp/emailRegExp.js";

export const authenticateJWT = (req,res,next)=>{
    try{
        /*получить токен из заголовка Authorization. Если заголовок существует,
            мы разбиваем его на части по пробелу и берем второй элемент (токен).
         Используем оператор опциональной цепочки (?.), чтобы избежать ошибок, если заголовок отсутствует.*/
        const token =req.headers['authorization']?.split(' ')[1];
        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if(err){
                    res.status(403).json({message:"HTTP 403 FORBIDDEN"});
                }
                /*Если токен действителен, в user передаются данные, закодированные в токене (например, id и email).
                    Эти данные сохраняются в объекте запроса (req.user), чтобы их можно было использовать в следующих
                     middleware или обработчиках маршрута.*/
                // req.user = user;
                const userEmail = user.email;
                if(!adminEmailRegExp.test(userEmail)){
                    res.status(403).json({message:"Access denied"});
                }
                next();

            })
        }else{
            res.status(401).send({message:"No Token"});
        }
    }catch (err){
        res.status(500).message({message:"Server Error"});
    }
}