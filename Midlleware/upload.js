const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dsovbtcqn",
    api_key: "723991738261599",
    api_secret: "lYQascciwDE1iHQ6y02WPaLIm2M",
});

// Multer storage setup for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Allow the file
    } else {
        cb(new Error("Invalid file type"), false);
    }
};

// Initialize multer with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Function to upload a file to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto", // Automatically detect file type
                folder: "notes_attachments", // Optional folder in Cloudinary
            },
            (error, result) => {
                if (error) {
                    reject(error); // If there is an error, reject the promise
                } else {
                    resolve(result); // If successful, resolve with the result
                }
            }
        );

        // Convert file buffer to stream and upload to Cloudinary
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

module.exports = { upload, uploadToCloudinary };
