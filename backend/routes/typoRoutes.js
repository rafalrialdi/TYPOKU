const express = require('express');
const multer = require('multer');

const {
  cekTypo,
  parafraseTypo,
  downloadResult,
} = require('../controllers/typoController');

const authenticate = require('../middleware/authenticate');
const checkSubscription = require('../middleware/checkSubscription');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true);
    }

    const filename = (file.originalname || '').toLowerCase();

    if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
      return cb(null, true);
    }

    return cb(
      Object.assign(
        new Error('Format file tidak didukung. Harap unggah PDF atau DOCX.'),
        { statusCode: 400 }
      )
    );
  },
});

router.post('/', authenticate, checkSubscription, upload.single('file'), cekTypo);
router.post('/parafrase', authenticate, checkSubscription, upload.single('file'), parafraseTypo);
router.get('/download/:id', downloadResult);
router.get('/download', downloadResult);
router.post('/download', downloadResult);

module.exports = router;
