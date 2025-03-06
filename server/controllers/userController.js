import db from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerController(req, res) {
    try {
        const { email, password} = req.body;
        let {role} = req.body;

        // Проверка обязательных полей
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Проверка корректности email
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegExp.test(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // Проверка на специальный email для админа
        const adminEmailRegExp = /^adminDBadmin@(mail\.ru|gmail\.com)$/;
        adminEmailRegExp.test(email) ? role = "admin" : role = "user";

        // Проверка сложности пароля
        const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*/]).{8,}$/;
        if (!passwordRegExp.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least 1 number, 1 lowercase letter, 1 uppercase letter, and 1 special character." });
        }

        // Проверка существования пользователя
        const existingUser = await db.query('SELECT * FROM users WHERE email = \$1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);


        const roleQuery = await db.query('SELECT id FROM roles WHERE name = \$1', [role]);
        if (roleQuery.rows.length === 0) {
            return res.status(500).json({ message: 'Role not found' });
        }
        const roleName = roleQuery.rows[0].id;



        // Создание нового пользователя
        const newUser = await db.query('INSERT INTO users (email, password, role) VALUES (\$1, \$2, \$3) RETURNING *', [email, hashedPassword, role]);
        const userId = newUser.rows[0].id;


        // Назначение роли пользователю
        await db.query('INSERT INTO user_roles (user_id, role_id) VALUES (\$1, \$2)', [userId, roleQuery.rows[0].id]);

        // Успешный ответ
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({message:err.message});
    }
}

export async function authorizationController(req,res){
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return res.status(400).json({error: "Username and password are required"});
        }

        const result = await db.query(
            "SELECT * FROM user WHERE username = \$1 ", [username])
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