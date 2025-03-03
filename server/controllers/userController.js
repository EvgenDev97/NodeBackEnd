import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {validRoles} from "../roles/roles.js";
export async function registerController(req, res) {
    try{
        const {username, password, role} = req.body;
        if(!username || !password){
            return res.status(400).json({error: "Username and password are required"});
        }
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegExp.test(username)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*/]).{8,}$/;
        if (!passwordRegExp.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least 1 number, 1 lowercase letter, 1 uppercase letter, and 1 special character." });
        }

        if(!validRoles.includes(role)){
            return res.status(400).json({ message: "Invalid role" });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const sqlRequest = `INSERT INTO users (username, password)
                                    VALUES (\$1, \$2)
                                    ON CONFLICT (username) 
                                    DO NOTHING`
        db.query(sqlRequest, [username, hashPassword], (err, result) => {
            if(err){
                return res.status(500).json({"error":"Server Error"});
            }
            if(result.rowCount === 0){
                //if rowCount = 0 that is means duplicate
                return res.status(409).json({message:"User already exists"});
            }
            res.status(201).json({message:"User have registered"});
        });
    }catch (err){
        console.log(err);
        res.status(500).json({message:"SERVER_ERROR"});
    }
}

export async function authorizationController(req,res){
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({error: "Username and password are required"});
        }

        const result = await db.query(
            "SELECT * FROM users WHERE username = \$1 ", [username])
        const user = result.rows[0];
        if(user && (await bcrypt.compare(password, user.password))){
            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"});
            res.json({token: token});
        }else{
            res.status(401).json({message:"Invalid credentials"});
        }
    }catch (err){
        res.status(500).json({message:"SERVER ERROR"});
    }
}