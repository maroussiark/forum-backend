import express from "express";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { secureCors } from "./middlewares/cors.js";
import { sanitize } from "./middlewares/sanitize.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);
app.use(secureCors);
app.use(sanitize);

export default app;
