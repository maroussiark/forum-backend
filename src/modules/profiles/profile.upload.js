import fs from "fs";
import path from "path";

export async function processAvatar(file) {
  if (!file) return null;

  const fileName = `avatar-${Date.now()}.webp`;
  const dirPath = path.join("uploads", "avatars");
  const outputPath = path.join(dirPath, fileName);

  // s’assure que le dossier existe
  fs.mkdirSync(dirPath, { recursive: true });

  await sharp(file.buffer)
    .resize(256, 256)
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/avatars/${fileName}`;
}
