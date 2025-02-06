const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const auth = require("../midlleware/auth");
const upload = require("../midlleware/upload");
const { v4: uuidv4 } = require("uuid");

// 📌 Buat catatan baru
router.post("/", auth, upload.array("files", 5), async (req, res) => {
    try {
        const { title, content } = req.body;

        const attachments = req.files?.map(file => ({
            type: file.mimetype.startsWith("image/") ? "image" : "file",
            url: `/uploads/${file.filename}`,
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        })) || [];

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
            message: "Catatan berhasil dibuat",
            data: note,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: "Gagal membuat catatan",
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
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No file uploaded",
            });
        }

        const note = await Note.findOne({ noteId: req.params.noteId, userId: req.user._id });
        if (!note) {
            return res.status(404).json({
                status: "error",
                message: "Catatan tidak ditemukan",
            });
        }

        note.attachments.push({
            type: req.body.type || (req.file.mimetype.startsWith('image/') ? 'image' : 'file'),
            url: `/uploads/${req.file.filename}`,
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });

        await note.save();

        res.json({
            status: "success",
            message: "Attachment berhasil ditambahkan",
            data: note,
        });
    } catch (error) {
        console.error(error);  
        res.status(400).json({
            status: "error",
            message: "Gagal menambahkan attachment",
            error: error.message,
        });
    }
});



module.exports = router;
