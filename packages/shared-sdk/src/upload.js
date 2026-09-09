const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirs = ['public/uploads/resumes', 'public/uploads/profiles', 'public/uploads/company-logos', 'public/uploads/videos'];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let uploadPath = 'public/uploads/';
    if (file.fieldname === 'resume') uploadPath += 'resumes/';
    else if (file.fieldname === 'profilePicture') uploadPath += 'profiles/';
    else if (file.fieldname === 'companyLogo') uploadPath += 'company-logos/';
    else if (file.fieldname === 'video') uploadPath += 'videos/';
    else uploadPath += 'resumes/';
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const allowedTypes = {
  resume: ['.pdf', '.doc', '.docx'],
  profilePicture: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  companyLogo: ['.jpg', '.jpeg', '.png', '.svg', '.webp'],
  video: ['.mp4', '.mov', '.webm', '.mkv'],
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = allowedTypes[file.fieldname] || [];
  // Allow video only if explicitly expected — otherwise reject
  if (allowed.includes(ext)) return cb(null, true);
  cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowed.join(', ')}`), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for video; resumes will be checked separately
  fileFilter,
});

// Back-compat + new: export generic instance plus named helpers
exports.upload = upload;
exports.uploadResume = upload.single('resume');
exports.uploadProfile = upload.single('profilePicture');
exports.uploadCompanyLogo = upload.single('companyLogo');
exports.uploadResumeAndVideo = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);
exports.uploadMultiple = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
]);

exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') req.flash('error', 'File too large. Max 50MB for video, 5MB for resume.');
    else req.flash('error', `Upload error: ${err.message}`);
    return res.redirect('back');
  }
  if (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  next();
};
