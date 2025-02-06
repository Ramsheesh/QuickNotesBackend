const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const auth = require("../Midlleware/auth");
const upload = require("../Midlleware/upload");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require('cloudinary');
// 📌 Buat catatan baruu
router.post("/", auth, upload.array("files", 5), async (req, res) => {
    try {
        const { title, content } = req.body;

        const attachments = [];

        // Loop through each file uploaded by the user
        for (const file of req.files) {
            const uploadResult = await cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto', // Automatically detect the file type (image, pdf, etc.)
                    folder: 'notes_attachments', // Folder in Cloudinary to store files
                },
                (error, result) => {
                    if (error) {
                        console.error("Error uploading to Cloudinary:", error);
                        return res.status(500).json({
                            status: "error",
                            message: "Failed to upload file to Cloudinary",
                            error: error.message,
                        });
                    }

                    // Push the file info into the attachments array
                    attachments.push({
                        type: result.resource_type,
                        url: result.secure_url, // Cloudinary URL
                        filename: file.originalname,
                        mimetype: file.mimetype,
                        size: file.size,
                    });
                }
            );

            // Pass the file to Cloudinary for upload
            file.stream.pipe(uploadResult);
        }

        // Create the note
        const note = new Note({
            noteId: uuidv4(),
            userId: req.user._id,
            title,
            content,
            attachments,
        });

        await note.save();
        res.status(201).json({
            status: "success",
            message: "Note successfully created",
            data: note,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            status: "error",
            message: "Failed to create note",
            error: error.message,
        });
    }
});

// 📌 Ambil semua catatan user
router.get("/", auth, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id });
        res.json({
            status: "success",
            message: "Daftar catatan berhasil diambil",
            data: notes,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Gagal mengambil catatan",
            error: error.message,
        });
    }
});

// 📌 Ambil catatan berdasarkan kata kunci (SEARCH QUERY)
router.get("/search/:query", auth, async (req, res) => {
    try {
        const query = req.params.query;
        const notes = await Note.find({
            userId: req.user._id,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
            ],
        });

        res.json({
            status: "success",
            message: `Hasil pencarian untuk "${query}"`,
            data: notes,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Gagal mencari catatan",
            error: error.message,
        });
    }
});

// 📌 Ambil detail catatan berdasarkan noteId
router.get("/:noteId", auth, async (req, res) => {
    try {
        const note = await Note.findOne({ noteId: req.params.noteId, userId: req.user._id });
        if (!note) return res.status(404).json({ status: "error", message: "Catatan tidak ditemukan" });

        res.json({
            status: "success",
            message: "Catatan berhasil ditemukan",
            data: note,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Gagal mengambil catatan",
            error: error.message,
        });
    }
});

// 📌 Update catatan berdasarkan noteId
router.patch("/:noteId", auth, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { noteId: req.params.noteId, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!note) return res.status(404).json({ status: "error", message: "Catatan tidak ditemukan" });

        res.json({
            status: "success",
            message: "Catatan berhasil diperbarui",
            data: note,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Gagal memperbarui catatan",
            error: error.message,
        });
    }
});

// 📌 Hapus catatan berdasarkan noteId
router.delete("/:noteId", auth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ noteId: req.params.noteId, userId: req.user._id });
        if (!note) return res.status(404).json({ status: "error", message: "Catatan tidak ditemukan" });

        res.json({
            status: "success",
            message: "Catatan berhasil dihapus",
            data: note,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Gagal menghapus catatan",
            error: error.message,
        });
    }
});

// 📌 Tambahkan attachment ke catatan berdasarkan noteId
router.post("/:noteId/attachment", auth, upload.single('file'), async (req, res) => {
    try {
        // Check if the file is provided
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No file uploaded",
            });
        }

        // Find the note by noteId and userId
        const note = await Note.findOne({ noteId: req.params.noteId, userId: req.user._id });
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Note not found",
            });
        }

        // Upload the file to Cloudinary
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto', // Automatically detect the file type (image, pdf, etc.)
                folder: 'notes_attachments', // Optional: Specify folder in Cloudinary
            },
            (error, result) => {
                if (error) {
                    console.error("Error uploading to Cloudinary:", error);
                    return res.status(500).json({
                        status: "error",
                        message: "Failed to upload file to Cloudinary",
                        error: error.message,
                    });
                }

                // Push the file info into the attachments array
                note.attachments.push({
                    type: req.body.type || (req.file.mimetype.startsWith('image/') ? 'image' : 'file'),
                    url: result.secure_url,  // Cloudinary URL for the uploaded file
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                });

                // Save the note with the new attachment
                note.save()
                    .then(updatedNote => {
                        res.json({
                            status: "success",
                            message: "Attachment successfully added",
                            data: updatedNote,
                        });
                    })
                    .catch(saveError => {
                        console.error(saveError);
                        res.status(500).json({
                            status: "error",
                            message: "Failed to save attachment",
                            error: saveError.message,
                        });
                    });
            }
        ).end(req.file.buffer); // Pass the file buffer to Cloudinary
    } catch (error) {
        console.error(error);  
        res.status(400).json({
            status: "error",
            message: "Failed to add attachment",
            error: error.message,
        });
    }
});

module.exports = router;