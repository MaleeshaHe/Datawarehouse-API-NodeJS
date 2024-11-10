const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const csv = require("csv-parser");
const app = express();
const PORT = 3000;
// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Files will be stored in the 'uploads' directory
// Middleware to parse JSON
app.use(express.json());
app.use(express.static("uploads")); // Serve uploaded files
// Serve the HTML file for the upload form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
// Load competitors data from CSV file
const loadCompetitorsData = (data) => {
  return new Promise((resolve) => {
    resolve(data);
  });
};
// Endpoint to upload a CSV file
app.post("/api/upload-csv", upload.single("file"), (req, res) => {
  const results = [];
  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      // Save the uploaded data to competitors.json
      fs.writeFile(
        path.join(__dirname, "competitors.json"),
        JSON.stringify(results, null, 2),
        (err) => {
          if (err) {
            return res.status(500).send("Error saving data");
          }
          // Optionally delete the uploaded CSV file
          fs.unlinkSync(req.file.path);
          res.status(200).send("CSV file processed and data saved");
        }
      );
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error processing CSV file");
    });
});
// Endpoint to get all competitors
app.get("/api/item-unit-price", async (req, res) => {
  try {
    const competitorsData = await new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, "competitors.json"),
        "utf8",
        (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(JSON.parse(data));
        }
      );
    });
    res.json(competitorsData);
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).send("Error loading competitors data");
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
