const express = require('express');
const { createClient } = require("@libsql/client");
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config();


const client = createClient({
    url: process.env.LIBSQL_URL,
    authToken: process.env.LIBSQL_AUTH_TOKEN
});

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000;

app.get('/categories', async (rep, res) => {
    try {
        const categories = await client.execute("SELECT * FROM categories");

        res.json(categories.rows);
    } catch (error) {
        res.status(500).json({ message: "Error getting categories", error: error.message });
    }
});

app.get('/products', async (rep, res) => {
    try {
        const products = await client.execute("SELECT * FROM products");

        res.json(products.rows);
    } catch (error) {
        res.status(500).json({ message: "Error getting products", error: error.message });
    }

});

app.post('/products', async (req, res) => {
    const { title, price, description, categoryId, image } = req.body;

    try {
        await client.execute(`
            INSERT INTO products (title, price, description, categoryId, image) VALUES ("${title}", "${price}", "${description}", "${categoryId}", "${image}");
        `);

        res.json({ message: "product created" });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
});

app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { title, price, image } = req.body;

    try {
        await client.execute(`
            UPDATE products
            SET title = "${title}", 
                price = "${price}",
                image = "${image}"
            WHERE id = ${id};
        `);

        res.json({ message: "product Update" });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await client.execute(`DELETE FROM products WHERE id = ${id}`);
        if (product.rowsAffected === 0) {
            res.json({ Error: "product not found in the database" });
        } else {
            res.json({ message: "product deleted" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});