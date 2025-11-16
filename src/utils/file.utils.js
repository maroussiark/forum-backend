import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { extname, basename, join } from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';

class FileUtils {
  /**
   * Créer les dossiers nécessaires
   */
  static async createDirectories(config) {
    for (const dir of Object.values(config.storage)) {
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Générer un nom de fichier unique
   */
  static generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const ext = extname(originalName);
    const nameWithoutExt = basename(originalName, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${sanitizedName}_${timestamp}_${randomString}${ext}`;
  }

  /**
   * Déterminer le type de fichier
   */
  static getFileType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('pdf') || mimetype.includes('document') || 
        mimetype.includes('sheet') || mimetype.includes('text')) return 'document';
    return 'others';
  }

  /**
   * Obtenir le dossier de destination
   */
  static getDestinationFolder(fileType, config) {
    return config.storage[fileType] || config.storage.others;
  }

  /**
   * Valider la taille du fichier
   */
  static validateFileSize(size, fileType, config) {
    const limit = config.limits[fileType] || config.limits.default;
    return size <= limit;
  }

  /**
   * Valider le type MIME
   */
  static validateMimeType(mimetype, fileType, config) {
    const allowedTypes = config.allowedMimeTypes[fileType];
    if (!allowedTypes) return true;
    return allowedTypes.includes(mimetype);
  }

  /**
   * Valider l'extension
   */
  static validateExtension(filename, fileType, config) {
    const ext = extname(filename).toLowerCase();
    const allowedExts = config.allowedExtensions[fileType];
    if (!allowedExts) return true;
    return allowedExts.includes(ext);
  }

  /**
   * Optimiser une image
   */
  static async optimizeImage(filePath, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality })
        .toFile(filePath + '.optimized');

      await fs.unlink(filePath);
      await fs.rename(filePath + '.optimized', filePath);
      
      return true;
    } catch (error) {
      console.error('Erreur optimisation image:', error);
      return false;
    }
  }

  /**
   * Créer une miniature
   */
  static async createThumbnail(filePath, thumbnailPath, size = 200) {
    try {
      await sharp(filePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat('jpeg', { quality: 70 })
        .toFile(thumbnailPath);
      
      return true;
    } catch (error) {
      console.error('Erreur création miniature:', error);
      return false;
    }
  }

  /**
   * Supprimer un fichier de manière sécurisée
   */
  static async deleteFile(filePath) {
    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      return false;
    }
  }

  /**
   * Obtenir les informations d'un fichier
   */
  static async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    } catch (error) {
        console.error('Erreur obtention info fichier:', error);
      return { exists: false };
    }
  }

  /**
   * Scanner un fichier pour les menaces (basique)
   */
  static async scanFile(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const header = buffer.toString('hex', 0, 4);
      
      // Vérifier les signatures de fichiers malveillants connus
      const maliciousSignatures = [
        '4d5a9000', // PE executable
        'd0cf11e0', // Microsoft Office (potentiellement dangereux)
      ];

      // Liste blanche des signatures sûres
    //   const safeSignatures = {
    //     'ffd8ffe0': 'jpeg',
    //     'ffd8ffe1': 'jpeg',
    //     '89504e47': 'png',
    //     '47494638': 'gif',
    //     '25504446': 'pdf',
    //     '504b0304': 'zip/docx/xlsx',
    //   };

      if (maliciousSignatures.includes(header)) {
        return { safe: false, reason: 'Signature de fichier exécutable détectée' };
      }

      return { safe: true };
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      return { safe: false, reason: 'Erreur lors du scan' };
    }
  }

  /**
   * Nettoyer les fichiers temporaires anciens
   */
  static async cleanTempFiles(tempDir, maxAge = 3600000) { // 1 heure par défaut
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = join(tempDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          await fs.unlink(filePath);
          console.log(`Fichier temporaire supprimé: ${file}`);
        }
      }
    } catch (error) {
      console.error('Erreur nettoyage fichiers temp:', error);
    }
  }
}

export default FileUtils;
