const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "https://competitor-api.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
const upload = multer({ dest: "/tmp" }); // Vercel functions allow temporary file storage in /tmp

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/api/upload-csv", upload.single("file"), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      res.status(200).json({ message: "CSV file processed", data: results });
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error processing CSV file");
    });
});

app.get("/api/competitors", async (req, res) => {
  try {
    const dataPath = path.join(__dirname, "competitors.json");
    const competitorsData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    res.json(competitorsData);
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).send("Error loading competitors data");
  }
});

app.get("/api/test", async (req, res) => {
  res.json({ message: "Hello from the API!" });
});

module.exports = app;
