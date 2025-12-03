const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Crea cartelle se non esistono
const ensureUploadDirs = async () => {
  const dirs = [
    'uploads',
    'uploads/requests',
    'uploads/portfolio',
    'uploads/designs',
    'uploads/temp'
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

ensureUploadDirs();

// Configurazione storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determina cartella in base al tipo
    let folder = 'temp';
    
    if (req.baseUrl.includes('requests')) {
      folder = 'requests';
    } else if (req.baseUrl.includes('portfolio')) {
      folder = 'portfolio';
    } else if (req.baseUrl.includes('designs')) {
      folder = 'designs';
    }
    
    cb(null, `uploads/${folder}`);
  },
  filename: function (req, file, cb) {
    // Genera nome univoco: uuid-timestamp-originalname
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo file non consentito: ${file.mimetype}. Tipi permessi: ${allowedTypes.join(', ')}`), false);
  }
};

// Configurazione multer base
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Max 5 file contemporaneamente
  }
});

// Middleware per singolo file
const uploadSingle = (fieldName = 'file') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File troppo grande. Dimensione massima: 10MB'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Troppi file. Massimo 5 file'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Errore upload: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Middleware per file multipli
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Uno o più file troppo grandi. Dimensione massima: 10MB per file'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Troppi file. Massimo ${maxCount} file`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Errore upload: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Helper per eliminare file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper per spostare file
const moveFile = async (oldPath, newPath) => {
  try {
    await fs.rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  moveFile
};