const multer = require('multer');
const path = require('path');
const fs = require('fs');

// שימוש בנתיב אבסולוטי שמוביל לשורש ה-Backend
const uploadDir = path.join(__dirname, '../uploads');

// בדיקה ויצירה אוטומטית של התיקייה במידה והיא חסרה
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // יצירת שם ייחודי חזק למניעת דריסת קבצים
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ניתן להעלות קובצי תמונה בלבד!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // הגבלת גודל קובץ עד 5MB
});

module.exports = upload;