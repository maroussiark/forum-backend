import multer from "multer";
import FileUtils from "../../utils/file.utils.js";
import uploadConfig from "../../config/upload.config.js";
import { join } from "path";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadConfig.storage.temp);
  },
  filename: (req, file, cb) => {
    const unique = FileUtils.generateUniqueFileName(file.originalname);
    cb(null, unique);
  }
});

export const uploadAttachments = multer({
  storage,
  limits: { fileSize: uploadConfig.limits.default }
}).array("files", 10);

/**
 * Retourne la liste des fichiers préparés pour traitement :
 * - chemin temporaire
 * - nom final
 * - type
 */
export async function prepareFiles(files) {
  const prepared = [];

  for (const file of files) {
    const tempPath = file.path;
    const fileType = FileUtils.getFileType(file.mimetype);

    // Validation taille
    if (!FileUtils.validateFileSize(file.size, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Validation extension
    if (!FileUtils.validateExtension(file.originalname, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Validation MIME
    if (!FileUtils.validateMimeType(file.mimetype, fileType, uploadConfig)) {
      await FileUtils.deleteFile(tempPath);
      continue;
    }

    // Destination finale selon type
    const destFolder = FileUtils.getDestinationFolder(fileType, uploadConfig);
    const finalPath = join(destFolder, file.filename);

    prepared.push({
      tempPath,
      finalPath,
      fileType,
      fileName: file.filename,
      fileSize: file.size,
      mimetype: file.mimetype
    });
  }

  return prepared;
}
