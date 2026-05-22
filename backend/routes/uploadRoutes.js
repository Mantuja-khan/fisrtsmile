import express from "express";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const router = express.Router();

// Derive current __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", (req, res) => {
  try {
    const { image, name } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Strict Absolute Path construction: Go up one level to "backend/", then into "uploads"
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // image is expected to be a data URL like "data:image/png;base64,iVBORw0KGgo..."
    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid base64 image data" });
    }

    const extension = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `${Date.now()}-${name ? name.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "image"}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    // Return the URL path
    const fileUrl = `/uploads/${fileName}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
});

export default router;
