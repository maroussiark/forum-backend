import prisma from "../../config/database.js";
import FileUtils from "../../utils/file.utils.js";
import { promises as fs } from "fs";

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

        await FileUtils.createThumbnail(
          file.tempPath,
          thumbPath,
          300
        );
      }

      // Move final file
      await fs.rename(file.tempPath, file.finalPath);

      const attachment = await prisma.attachment.create({
        data: {
          id: file.fileName,
          postId,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          fileUrl: file.finalPath.replace(/\\/g, "/"),
        }
      });

      results.push(attachment);
    }

    return results;
  }
}

export default new AttachmentService();
