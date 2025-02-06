const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const noteSchema = new mongoose.Schema(
    {
        noteId: { type: String, default: uuidv4, unique: true }, 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        attachments: [
            {
                type: { type: String, enum: ["file", "image", "link"] },
                url: String,
                filename: String,
                mimetype: String,
                size: Number,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
