import multer, { diskStorage } from 'multer';
import uploadConfig, { limits as _limits } from '../config/upload.config';
import { createDirectories, getFileType, getDestinationFolder, generateUniqueFileName, validateMimeType, validateExtension, validateFileSize, deleteFile, scanFile, optimizeImage } from '../utils/file.utils.js';

// Configuration du stockage
const storage = diskStorage({
  destination: async (req, file, cb) => {
    try {
      await createDirectories(uploadConfig);
      const fileType = getFileType(file.mimetype);
      const destination = getDestinationFolder(fileType, uploadConfig);
      cb(null, destination);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFileName(file.originalname);
    cb(null, uniqueName);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  const fileType = getFileType(file.mimetype);
  
  // Valider le type MIME
  if (!validateMimeType(file.mimetype, fileType, uploadConfig)) {
    return cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }

  // Valider l'extension
  if (!validateExtension(file.originalname, fileType, uploadConfig)) {
    return cb(new Error(`Extension de fichier non autorisée`), false);
  }

  cb(null, true);
};

// Configuration de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(_limits)),
    files: 10, // Maximum 10 fichiers par requête
  }
});

// Middleware de validation post-upload
const validateUpload = async (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ error: 'Aucun fichier uploadé' });
  }

  const files = req.files || [req.file];

  try {
    for (const file of files) {
      const fileType = getFileType(file.mimetype);

      // Vérifier la taille
      if (!validateFileSize(file.size, fileType, uploadConfig)) {
        await deleteFile(file.path);
        return res.status(400).json({
          error: `Fichier trop volumineux. Maximum: ${_limits[fileType] / (1024 * 1024)} MB`
        });
      }

      // Scanner le fichier
      const scanResult = await scanFile(file.path);
      if (!scanResult.safe) {
        await deleteFile(file.path);
        return res.status(400).json({
          error: `Fichier potentiellement dangereux: ${scanResult.reason}`
        });
      }

      // Optimiser les images
      if (fileType === 'image' && file.mimetype !== 'image/svg+xml') {
        await optimizeImage(file.path, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erreur validation upload:', error);
    return res.status(500).json({ error: 'Erreur lors de la validation du fichier' });
  }
};

export default {
  upload,
  validateUpload,
  uploadSingle: (fieldName) => [upload.single(fieldName), validateUpload],
  uploadMultiple: (fieldName, maxCount = 10) => [upload.array(fieldName, maxCount), validateUpload],
  uploadFields: (fields) => [upload.fields(fields), validateUpload],
};
