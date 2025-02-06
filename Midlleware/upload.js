const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dsovbtcqn",
    api_key: "723991738261599",
    api_secret: "lYQascciwDE1iHQ6y02WPaLIm2M",
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Function to upload a file to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto", 
                folder: "notes_attachments", 
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result); 
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = { upload, uploadToCloudinary };
