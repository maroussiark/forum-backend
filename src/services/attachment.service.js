import prisma from "../config/database.js";
import { generateId } from "../utils/idGenerator.js";

class AttachmentService {
  async addAttachment(postId, file) {
    const id = await generateId("attachment", "ATT-");

    return prisma.attachment.create({
      data: {
        id,
        postId,
        fileName: file.filename,
        fileType: file.mimetype,
        fileSize: file.size,
        fileUrl: `/uploads/posts/${file.filename}`
      }
    });
  }

  async deleteAttachment(id) {
    return prisma.attachment.delete({ where: { id } });
  }
}

export default new AttachmentService();
