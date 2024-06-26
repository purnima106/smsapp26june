const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const multer = require("multer");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL setup
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "purnima@123",
    database: "sms0226june24"
});

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Save endpoint with file upload
app.post("/save", upload.single('file'), async (req, res) => {
    const { rno, name, marks } = req.body;
    const image = req.file ? req.file.filename : null;
    const data = [rno, name, marks, image];
    
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("sms26june24");
    const coll = db.collection("student");
    const record = { "_id": rno, name, marks, image };

    try {
        await coll.insertOne(record);
        const sql = "INSERT INTO student (rno, name, marks, image) VALUES (?, ?, ?, ?)";
        con.query(sql, data, (err, result) => {
            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    } catch (err) {
        res.send(err);
    } finally {
        client.close();
    }
});

// Delete endpoint with file removal
app.delete("/rrs", (req, res) => {
    const { rno, image } = req.body;
    const data = [rno];

    if (image) {
        fs.unlink(`./uploads/${image}`, (err) => {
            if (err) {
                console.error("Failed to delete file:", err);
            }
        });
    }

    const sql = "DELETE FROM student WHERE rno = ?";
    con.query(sql, data, (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
});

// MongoDB save endpoint
app.post("/save-mongo", async (req, res) => {
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("sms26june24");
    const coll = db.collection("student");
    const record = { "_id": req.body.rno, name: req.body.name, marks: req.body.marks };

    try {
        const result = await coll.insertOne(record);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        client.close();
    }
});

// Get all records
app.get("/gs", async (req, res) => {
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("sms26june24");
    const coll = db.collection("student");

    try {
        const result = await coll.find({}).toArray();
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        client.close();
    }
});

// Delete record from MongoDB
app.delete("/rs", async (req, res) => {
    const { rno } = req.body;
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("sms26june24");
    const coll = db.collection("student");
    const record = { "_id": rno };

    try {
        const result = await coll.deleteOne(record);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        client.close();
    }
});

// Update record in MongoDB
app.put("/us", async (req, res) => {
    const { rno, name, marks } = req.body;
    const url = "mongodb://0.0.0.0:27017";
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db("sms26june24");
    const coll = db.collection("student");
    const whom = { "_id": rno };
    const what = { "$set": { name, marks } };

    try {
        const result = await coll.updateOne(whom, what);
        res.send(result);
    } catch (err) {
        res.send(err);
    } finally {
        client.close();
    }
});

app.listen(9000, () => { console.log("Ready to serve @9000"); });
