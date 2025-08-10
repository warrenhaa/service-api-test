import multer from 'multer';

const path = require('path');

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes('excel')
    || file.mimetype.includes('spreadsheetml')
  ) {
    cb(null, true);
  } else {
    cb('Please upload only excel file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-service-api-${file.originalname}`);
  },
});

const uploadFile = multer({ storage, fileFilter: excelFilter });
export default uploadFile;
