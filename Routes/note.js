const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const auth = require("../Midlleware/auth");
const { upload, uploadToCloudinary } = require("../Midlleware/upload");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require('cloudinary');


// 📌 Buat catatan baruu
// Create a new note without attachments
router.post("/", auth, async (req, res) => {
    try {
        const { title, content } = req.body;

        // Create a new note with only title and content (no attachments)
        const note = new Note({
            noteId: uuidv4(),
            userId: req.user._id,
            title,
            content,
            attachments: [], // Empty array for attachments since we are not adding any
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
router.post("/:noteId/attachment", auth, upload.single("file"), async (req, res) => {
    try {
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

        // Upload the attachment to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        // Push the uploaded attachment info into the note's attachments array
        note.attachments.push({
            url: result.secure_url,  
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });

        // Save the updated note
        await note.save();

        res.json({
            status: "success",
            message: "Attachment successfully added to note",
            data: note,
        });
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