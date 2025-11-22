import multer from "multer";
import sharp from "sharp";
import path from "path";

const storage = multer.memoryStorage();

export const uploadAvatar = multer({ storage }).single("avatar");

export async function processAvatar(file) {
  if (!file) return null;

  const fileName = `avatar-${Date.now()}.webp`;
  const outputPath = path.join("uploads", "avatars", fileName);

  await sharp(file.buffer)
    .resize(256, 256)
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/avatars/${fileName}`;
}
