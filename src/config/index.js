require("dotenv").config();

export const port = process.env.PORT || 4000;
export const databaseUrl = process.env.DATABASE_URL;
export const jwtSecret = process.env.JWT_SECRET;
export const storagePath = process.env.STORAGE_PATH || "uploads";
