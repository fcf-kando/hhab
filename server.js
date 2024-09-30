const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const app = express();
const { authenticateUser, registerUser, getTransactionsByUserId, getTransactions, insertTransaction, updateTransaction, deleteTransaction, getCategories, insertCategory, deleteCategory } = require('./db');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'login')));
app.use(express.static(path.join(__dirname, 'register')));
app.use(express.static(path.join(__dirname, 'main')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'main.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register', 'register.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token } = await authenticateUser(email, password);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).send(error.message);
    }
});

app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await registerUser(email, username, hashedPassword);
        res.status(200).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

app.get('/transactions', verifyToken, async (req, res) => {
    try {
        const transactions = await getTransactionsByUserId(req.user.user_id);
        res.status(200).json(transactions.recordset);
        // console.log("transactions.recordset: ", transactions.recordset);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

app.get('/getUserId', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ user_id: decoded.user_id });
    } catch (error) {
        res.status(400).send('Invalid token');
    }
});

app.post('/insertTransaction', async (req, res) => {
    const { user_id, amount, description, transaction_date, category_name } = req.body;
    try {
        await insertTransaction(user_id, amount, description, transaction_date, category_name);
        res.status(200).send('Transaction inserted successfully');
    } catch (error) {
        console.error('Error inserting transaction:', error);
        res.status(500).send('Error inserting transaction');
    }
});

app.put('/updateTransaction/:id', async (req, res) => {
    const transactionId = parseInt(req.params.id, 10);
    const { amount, description, category } = req.body;

    try {
        const result = await updateTransaction(transactionId, amount, description, category);
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Transaction updated successfully');
        } else {
            res.status(400).send('No rows affected');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).send('Error updating transaction');
    }
});

app.delete('/deleteTransaction/:id', async (req, res) => {
    const transactionId = parseInt(req.params.id, 10);
    try {
        const result = await deleteTransaction(transactionId);
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('Transaction deleted successfully');
        } else {
            res.status(400).send('No rows affected');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).send('Error deleting transaction');
    }
});

app.get('/getCategories', async (req, res) => {
    try {
        const categories = await getCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).send('Error getting categories');
    }
});

app.post('/insertCategory', async (req, res) => {
    const { categoryName } = req.body;
    try {
        await insertCategory(categoryName);
        res.status(200).send('Category inserted successfully');
    } catch (error) {
        console.error('Error inserting category:', error);
        res.status(500).send('Error inserting category');
    }
});

app.delete('/deleteCategory', async (req, res) => {
    const { categoryName } = req.body;
    try {
        await deleteCategory(categoryName);
        res.status(200).send('カテゴリが正常に削除されました');
    } catch (error) {
        console.error('カテゴリの削除に失敗しました:', error);
        res.status(500).send('カテゴリの削除に失敗しました');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});