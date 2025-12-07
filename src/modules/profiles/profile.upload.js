// src/modules/profiles/profile.upload.js
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

// ⚠️ Named export attendu par profile.routes.js
export const uploadAvatar = multer({ storage }).single("avatar");

export async function processAvatar(file) {
  if (!file) return null;

  const fileName = `avatar-${Date.now()}.webp`;

  // Dossier où on stocke les avatars
  const dirPath = path.join(process.cwd(), "uploads", "avatars");
  const outputPath = path.join(dirPath, fileName);

  // S'assurer que le dossier existe (utile sur Render)
  fs.mkdirSync(dirPath, { recursive: true });

  await sharp(file.buffer)
    .resize(256, 256)
    .webp({ quality: 80 })
    .toFile(outputPath);

  // URL publique (servie par app.use("/uploads", express.static(...)))
  return `/uploads/avatars/${fileName}`;
}
