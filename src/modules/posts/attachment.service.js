import prisma from "../../config/database.js";
import FileUtils from "../../utils/file.utils.js";
import { promises as fs } from "fs";
import path from "node:path";

const UPLOADS_ROOT = path.resolve("uploads"); // doit pointer vers ton dossier uploads
const UPLOADS_PREFIX = "/uploads"; // ce sera ta route publique

class AttachmentService {
  async processAndStore(postId, preparedFiles) {
    const results = [];

    for (const file of preparedFiles) {
      // Scan basique
      const scan = await FileUtils.scanFile(file.tempPath);
      if (!scan.safe) {
        await FileUtils.deleteFile(file.tempPath);
        continue;
      }

      // Si image : optimize & thumbnail
      if (file.fileType === "image") {
        await FileUtils.optimizeImage(file.tempPath);
        const thumbPath = file.tempPath + "_thumb.webp";

        await FileUtils.createThumbnail(file.tempPath, thumbPath, 300);
      }

      // Move final file
      await fs.rename(file.tempPath, file.finalPath);

      console.log("Saved file at:", file.finalPath);

      // 🟢 Construire l'URL publique
      // file.finalPath ≈ F:/SVNM/forum-backend/uploads/others/xxx.png
      // UPLOADS_ROOT  ≈ F:/SVNM/forum-backend/uploads
      let relativePath = path.relative(UPLOADS_ROOT, file.finalPath); // => "others/xxx.png"
      relativePath = relativePath.replace(/\\/g, "/"); // Windows → URL friendly

      const publicUrl = `${UPLOADS_PREFIX}/${relativePath}`; // => "/uploads/others/xxx.png"

      const attachment = await prisma.attachment.create({
        data: {
          id: file.fileName,
          postId,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          fileUrl: publicUrl, // 🟢 URL WEB, plus de "F:/..."
        },
      });

      results.push(attachment);
    }

    return results;
  }
}

export default new AttachmentService();
