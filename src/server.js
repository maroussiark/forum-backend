require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Routes de test
app.get("/", (req, res) => {
  res.json({ message: "Forum backend is running" });
});

// Lancer le serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
