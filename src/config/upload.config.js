import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadConfig = {
  // Dossiers de stockage
  storage: {
    root: join(__dirname, '../../uploads'),
    temp: join(__dirname, '../../uploads/temp'),
    images: join(__dirname, '../../uploads/images'),
    documents: join(__dirname, '../../uploads/documents'),
    videos: join(__dirname, '../../uploads/videos'),
    others: join(__dirname, '../../uploads/others'),
  },

  // Limites par type de fichier (en bytes)
  limits: {
    image: 5 * 1024 * 1024,      // 5 MB
    document: 10 * 1024 * 1024,  // 10 MB
    video: 100 * 1024 * 1024,    // 100 MB
    default: 5 * 1024 * 1024,    // 5 MB
  },

  // Types MIME autorisés
  allowedMimeTypes: {
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    video: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ],
  },

  // Extensions autorisées
  allowedExtensions: {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'],
    video: ['.mp4', '.mpeg', '.mov', '.avi', '.webm'],
  },
};

export default uploadConfig;