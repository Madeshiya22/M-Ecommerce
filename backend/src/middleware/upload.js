const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Keep base uploadDir as destination so Multer creates WriteStream safely
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let subFolder = '';
    const type = req.body.type ? req.body.type.toLowerCase() : '';
    
    if (type === 'tshirt' || type === 't-shirt') {
      subFolder = 'T-shirt/';
    } else if (type === 'shirt') {
      subFolder = 'shirt/';
    }
    
    if (subFolder) {
      const fullSubDir = path.join(uploadDir, subFolder);
      if (!fs.existsSync(fullSubDir)) {
        fs.mkdirSync(fullSubDir, { recursive: true });
      }
    }
    
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
    
    // Prefix the subFolder so the relative path is returned in req.file.filename
    cb(null, subFolder + fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

module.exports = upload;
