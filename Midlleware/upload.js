// upload.js (in the middleware directory or appropriate place)
const multer = require("multer");
const cloudinary = require("cloudinary").v2; // Ensure using cloudinary.v2
const streamifier = require("streamifier"); // For handling buffer streams

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dsovbtcqn",
  api_key: "723991738261599",
  api_secret: "lYQascciwDE1iHQ6y02WPaLIm2M",
});

// File upload configuration with multer and memoryStorage
const storage = multer.memoryStorage();

// File filter for specific types (images, PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
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
        resource_type: "auto", // Detects file type automatically (image, pdf, etc.)
        folder: "notes_attachments", // Folder name in Cloudinary
      },
      (error, result) => {
        if (error) {
          reject(error); // Reject if there's an error
        } else {
          resolve(result); // Resolve if upload is successful
        }
      }
    );

    // Create stream from the buffer to upload to Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };
