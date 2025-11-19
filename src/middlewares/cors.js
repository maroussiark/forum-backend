import cors from "cors";

export const secureCors = cors({
  origin: [
    "https://tonsite.com",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});
