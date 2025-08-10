import multer from 'multer';

const path = require('path');

const jsonFilter = (req, file, cb) => {
  if ((file && file.mimetype.includes('json')) || (file && file.mimetype.includes('octet-stream'))) {
    cb(null, true);
  } else {
    cb('Please upload only json or octet-stream file.', false);
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

const uploadJsonFile = multer({ storage, fileFilter: jsonFilter });
export default uploadJsonFile;
