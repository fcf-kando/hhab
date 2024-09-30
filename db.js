const sql = require('mssql');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const config = {
    user: 'sa',
    password: 'hhab2024half',
    server: 'localhost\\SQLEXPRESS',
    database: 'HHAB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        nableArithAbort: true,
    }
};
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function getUsers(email) {
    // async function getUsers(email, password) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email=@email');
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error', err);
        throw err;
    }
};

async function registerUser(email, username, password) {
    const created_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('created_at', sql.DateTime, created_at)
            .query(`
                INSERT INTO
                    Users
                    (username, email, password, created_at)
                VALUES
                    (@username, @email, @password, @created_at)`
            );
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
    }
}

async function authenticateUser(email, password) {
    try {
        const userResult = await getUsers(email);
        if (userResult.recordset.length > 0) {
            const user = userResult.recordset[0];
            const isPasswordValid = bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
                return { token };
            } else {
                throw new Error('Invalid password');
            }
        } else {
            throw new Error('User not found');
        }
    } catch (err) {
        console.error('Authentication error', err);
        throw err;
    }
}

async function getTransactionsByUserId(user_id) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT
                    CONVERT(VARCHAR, t.transaction_date, 111) AS transaction_date,
                    t.transaction_id,
                    t.user_id,
                    t.amount,
                    t.description,
                    c.category_name
                FROM
                    TransactionData t
                JOIN
                    Categories c ON t.category_id = c.category_id
                WHERE
                    t.user_id = @user_id
                ORDER BY
                    t.transaction_date DESC
            `); pool.close();
        return result;
    } catch (err) {
        console.error('SQL error', err);
        throw err;
    }
}

async function getTransactions() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query(`
                SELECT
                    CONVERT(VARCHAR, t.transaction_date, 111) AS transaction_date,
                    t.transaction_id,
                    t.user_id,
                    t.amount,
                    t.description,
                    c.category_name
                FROM
                    TransactionData t
                JOIN
                    Categories c ON t.category_id = c.category_id
                ORDER BY
                    t.transaction_date DESC
            `);
        pool.close();
        return result.recordset;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function insertTransaction(user_id, amount, description, transaction_date, category_name) {
    const created_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    const updated_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    try {
        let pool = await sql.connect(config);

        let categoryResult = await pool.request()
            .input('category_name', sql.NVarChar, category_name)
            .query('SELECT * FROM Categories WHERE category_name = @category_name');
        if (categoryResult.recordset.length === 0) {
            throw new Error('Invalid category name');
        }

        const category_id = categoryResult.recordset[0].category_id;

        let result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('amount', sql.Decimal(18, 2), amount)
            .input('description', sql.NVarChar, description)
            .input('transaction_date', sql.DateTime, transaction_date)
            .input('category_id', sql.Int, category_id)
            .input('created_at', sql.DateTime, created_at)
            .input('updated_at', sql.DateTime, updated_at)
            .query(`
                    INSERT INTO
                        TransactionData
                        (user_id, amount, description, transaction_date, category_id, created_at, updated_at)
                    VALUES
                        (@user_id, @amount, @description, @transaction_date, @category_id, @created_at, @updated_at)`
            );

        pool.close();
        // console.log('result : ', result);
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function updateTransaction(transactionId, amount, description, category_name) {
    const updated_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    try {
        let pool = await sql.connect(config);
        let categoryResult = await pool.request()
            .input('category_name', sql.NVarChar, category_name)
            .query('SELECT * FROM Categories WHERE category_name = @category_name');
        if (categoryResult.recordset.length === 0) {
            throw new Error('Invalid category name');
        }

        const category_id = categoryResult.recordset[0].category_id;
        let result = await pool.request()
            .input('transactionId', sql.Int, transactionId)
            .input('amount', sql.Decimal(18, 2), amount)
            .input('description', sql.NVarChar, description)
            .input('category_id', sql.Int, category_id)
            .input('updated_at', sql.DateTime, updated_at)
            .query(`
                    UPDATE TransactionData SET
                        amount = @amount,
                        description = @description,
                        category_id = @category_id,
                        updated_at = @updated_at
                    WHERE
                        transaction_id = @transactionId`
            );
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function getCategories() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT category_name FROM Categories');
        pool.close();
        return result.recordset;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function deleteTransaction(transactionId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('transactionId', sql.Int, transactionId)
            .query('DELETE FROM TransactionData WHERE transaction_id = @transactionId');
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function insertCategory(categoryName) {
    const created_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss');
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('category_name', sql.NVarChar, categoryName)
            .input('created_at', sql.DateTime, created_at)
            .query(`
                INSERT INTO
                    Categories
                    (category_name, created_at)
                VALUES
                    (@category_name, @created_at)`
            );
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

async function deleteCategory(categoryName) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('category_name', sql.NVarChar, categoryName)
            .query('DELETE FROM Categories WHERE category_name = @category_name');
        pool.close();
        return result;
    } catch (err) {
        console.error('SQL error : ', err);
        throw err;
    }
}

module.exports = { authenticateUser, getTransactionsByUserId, getUsers, registerUser, getTransactions, insertTransaction, updateTransaction, deleteTransaction, getCategories, insertCategory, deleteCategory };