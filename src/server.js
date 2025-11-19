import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(json());
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
