import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// connect mysql
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query("SELECT id, email, balance FROM users WHERE id = ?", [id]);
  if (rows.length === 0) return res.status(404).json({ message: "User not found" });
  res.json(rows[0]);
});

app.post("/api/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    const [results] = await pool.query(query, [email, password]);

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0 || amount > 100000) return res.status(400).json({ message: "Invalid amount" });

    // add transaction
    await pool.query(
      "INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'deposit')",
      [userId, amount]
    );

    // update balance
    await pool.query(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
      [amount, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    // call balance 
    const [rows] = await pool.query("SELECT balance FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const balance = rows[0].balance;
    if (amount > balance) return res.status(400).json({ message: "Not enough balance" });

    // add transaction
    await pool.query(
      "INSERT INTO transactions (user_id, amount, type) VALUES (?, ?, 'withdraw')",
      [userId, amount]
    );

    // update balance
    await pool.query(
      "UPDATE users SET balance = balance - ? WHERE id = ?",
      [amount, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(
      `SELECT t.id, t.amount, t.type, t.created_at, u.email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ? 
        ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// edit amount transaction
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const [row] = await pool.query("SELECT * FROM transactions WHERE id = ?", [id]);
    if (!row.length) return res.status(404).json({ message: "Transaction not found" });

    const transaction = row[0];

    // change balance user
    if (transaction.type === "deposit") {
      await pool.query(
        "UPDATE users SET balance = balance - ? + ? WHERE id = ?",
        [transaction.amount, amount, transaction.user_id]
      );
    } else {
      await pool.query(
        "UPDATE users SET balance = balance + ? - ? WHERE id = ?",
        [transaction.amount, amount, transaction.user_id]
      );
    }

    // update transaction
    await pool.query("UPDATE transactions SET amount = ? WHERE id = ?", [amount, id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// delete transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await pool.query("SELECT * FROM transactions WHERE id = ?", [id]);
    if (!row.length) return res.status(404).json({ message: "Transaction not found" });

    const transaction = row[0];

    // ปรับค่า balance ของ user
    if (transaction.type === "deposit") {
      await pool.query("UPDATE users SET balance = balance - ? WHERE id = ?", [
        transaction.amount,
        transaction.user_id,
      ]);
    } else {
      await pool.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
        transaction.amount,
        transaction.user_id,
      ]);
    }

    await pool.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3000, '0.0.0.0',() => {
  console.log("🚀 Backend running on port 3000");
});
