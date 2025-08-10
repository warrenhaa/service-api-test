import multer from 'multer';

const path = require('path');

const imagefilter = (req, file, cb) => {
  if (file.mimetype.includes('png')
    || file.mimetype.includes('jpg')) {
    cb(null, true);
  } else {
    cb('Please upload only png or jpg file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-service-api-${file.originalname}`);
  },
});

const uploadFile = multer({ storage, fileFilter: imagefilter });
export default uploadFile;
