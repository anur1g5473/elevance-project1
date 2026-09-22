const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const roomRoutes = require("./routes/rooms");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/rooms", roomRoutes);

const clientPath = path.resolve(__dirname, "../../client");
app.use(express.static(clientPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Route not found." });
  }

  return res.sendFile(path.join(clientPath, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, PORT };
