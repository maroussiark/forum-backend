import express from "express";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
