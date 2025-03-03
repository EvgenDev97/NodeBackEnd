import jwt from "jsonwebtoken";

export const authenticateJWT = (req,res,next)=>{
    try{
        /*получить токен из заголовка Authorization. Если заголовок существует,
            мы разбиваем его на части по пробелу и берем второй элемент (токен).
         Используем оператор опциональной цепочки (?.), чтобы избежать ошибок, если заголовок отсутствует.*/
        const token =req.headers['authorization']?.split(' ')[1];
        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if(err){
                    res.status(403).message({message:"HTTP 403 FORBIDDEN"});
                }
                req.user = user;
                next();
            })
        }else{
            res.status(401).send({message:"No Token"});
        }
    }catch (err){
        res.status(500).message({message:"Server Error"});
    }
}