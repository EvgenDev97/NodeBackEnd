import db from "../db/db.js";

export async function getProducts(req, res) {
    try{
        const products = await db.query
        ('SELECT * FROM products ORDER BY create_at DESC ', [])
        res.status(200).json(products.rows);
    } catch(err){
        console.log(err);
        res.status(500).json({success: false, error: err});
    }
}


export async function getProductById(req, res) {
    try{
        const id =req.params.id;
        if(!id){
            res.status(404).json({success: false, error: "Product not found"});
        }
        const product = await db.query(
            `SELECT * FROM products WHERE id = \$1`,
            [id] // Используем параметризованный запрос
        );
        if(product.rows.length === 0){
            res.status(404).json({success: false, error: "Product not found"});
            return;
        }
        console.log(product.rows.length)
        res.status(200).json( product.rows);
    }catch (e){
        console.error( e);
        res.status(500).json({success: false, error: e});
    }
}

export async function createProduct(req, res) {
    const {name, price, image} = req.body;
    if(!name || !price || !image){
        return res.status(400).json({success: false, message: "All fields are required"});
    }
    try{
        const newProduct = await db.query(`
            INSERT INTO products (name, price, image)
            VALUES (\$1, \$2, \$3)
            RETURNING *
        `, [name, price, image]); // Используем параметризованные запросы
        console.log("added " + newProduct);
        res.status(201).json({ success: true, data: newProduct.rows[0] }); // Извлекаем первую строку из результата
        res.status(201).json({success: true, data: newProduct});
    }catch(err){

    }
}

export async function updateProduct(req, res) {
    /**
     * динамически формируем SQL-запрос.
     * Это можно сделать, проверяя, какие поля были переданы, и добавляя их в запрос только в том случае, если они существуют.
     * */
    const { name, price, image } = req.body;
    const id = req.params.id;
    // Начинаем формировать запрос
    const fields = [];
    const values = [];

    if (name) {
        fields.push(`name = $${fields.length + 1}`);
        values.push(name);
    }
    if (price) {
        const regex = /^\d+\.\d+$/
        if(!regex.test(price)){
            return res.json({success: false, error: "Invalid price format. Correct format is xx.xx"});
        }
        fields.push(`price = $${fields.length + 1}`);
        values.push(price);
    }
    if (image) {
        fields.push(`image = $${fields.length + 1}`);
        values.push(image);
    }
    // Проверяем, есть ли что обновлять
    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Создаем строку с полями для обновления
    const setClause = fields.join(", ");

    try {
        const updateProduct = await db.query(`UPDATE products
            SET ${setClause}
            WHERE id = $${fields.length + 1} RETURNING *`, [...values, id]); // Параметризованный запрос

        if (updateProduct.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, data: updateProduct.rows[0] }); // Возвращаем обновленный продукт
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Server error" }); // Обработка ошибки
    }
}

export async function deleteProduct(req, res) {
    const id = req.params.id;
    try{
        const deleteProduct = await db.query(`DELETE FROM products WHERE id = \$1 RETURNING *`, [id]);
        if (id === undefined) {
            res.status(400).json({ success: false, error: "no id" });
            return;
        }
        if(deleteProduct.rows.length === 0){
            res.status(404).json({success: false, message:"product not found"});
            return;
        }
        res.status(200).json({success: true, data: deleteProduct.rows});
    }catch(err){
        console.log(err);
        res.status(500).json({success: false, error: "server error"});
    }
}