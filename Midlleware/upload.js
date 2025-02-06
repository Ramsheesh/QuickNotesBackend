const multer = require('multer');
const cloudinary = require('cloudinary');


// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: 'dsovbtcqn',
    api_key: '723991738261599',
    api_secret: 'lYQascciwDE1iHQ6y02WPaLIm2M',
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ storage: storage });

module.exports = upload;
