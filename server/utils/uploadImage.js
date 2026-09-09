import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileTypeFromBuffer } from "file-type";
import mime from 'mime-types';
import slugify from "slugify";
dotenv.config();
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Uploads and processes an image.
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} originalName - The original file name.
 * @param {string} subfolder - The folder where the image should be saved.
 * @returns {Promise<string>} - Returns the image URL.
 */
export const uploadImage = async (
    file,
    subfolder = "avatars"
) => {
    const uploadsDir = path.join(process.cwd(), "uploads", subfolder);

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const detectedType = await fileTypeFromBuffer(file.data);
    const mimeType = detectedType?.mime || file.mimetype;

    const uniqueName = uuidv4();
    let fileName;
    let outputPath;

    if (mimeType.startsWith("image/")) {
        fileName = `${uniqueName}.webp`;
        outputPath = path.join(uploadsDir, fileName);

        await sharp(file.data)
            .webp({ quality: 90 })
            .toFile(outputPath);
    } else {
        const ext = path.extname(file.name);
        fileName = `${uniqueName}${ext}`;
        outputPath = path.join(uploadsDir, fileName);

        fs.writeFileSync(outputPath, file.data);
    }

    return `${process.env.IMG_URL}/image/${subfolder}/${fileName}`;
};

export const deleteImage = async (imageUrl) => {
    try {
        const { pathname } = new URL(imageUrl);
        const pathParts = pathname.split("/").filter(Boolean);

        if (pathParts.length < 3) return;

        const subfolder = pathParts.slice(1, -1).join("/");
        const imageName = pathParts[pathParts.length - 1];

        const imagePath = path.join(__dirname, "uploads", subfolder, imageName);

        if (!fs.existsSync(imagePath)) return;

        const deleteQueueDir = path.join(__dirname, "uploads", "delete-queue");

        if (!fs.existsSync(deleteQueueDir)) {
            fs.mkdirSync(deleteQueueDir, { recursive: true });
        }

        const taskFilePath = path.join(
            deleteQueueDir,
            `${Date.now()}__${subfolder.replace(/\//g, "__")}__${imageName}.json`
        );

        fs.writeFileSync(
            taskFilePath,
            JSON.stringify({ path: imagePath }),
            "utf-8"
        );
    } catch (err) {
        // ❗ Silent fail (log only)
        console.warn("Image delete skipped:", err.message);
    }
};



export const findImage = async (
    req,
    res
) => {
    try {
        const fullPath = req.params[0];

        const fileName = fullPath.split("/").pop();
        const subfolder =
            fullPath.split("/").slice(0, -1).join("/") || "images";

        let filePath = path.join(__dirname, "uploads", subfolder, fileName);

        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, "uploads", fileName);

            if (!fs.existsSync(filePath)) {
                filePath = path.join(__dirname, "uploads", "banner.webp");
            }
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        const mimeType =
            mime.lookup(filePath) || "application/octet-stream";
        const isImage = mimeType.startsWith("image/");

        const width = req.query.w ? Number(req.query.w) : undefined;
        const quality = req.query.q ? Number(req.query.q) : 75;

        let buffer;

        if (isImage && (width || quality !== 75)) {
            let image = sharp(filePath);

            if (fileExtension === ".webp" || req.query.webp !== "false") {
                image = image.webp({ quality });
                res.set("Content-Type", "image/webp");
            } else if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
                image = image.jpeg({ quality });
                res.set("Content-Type", "image/jpeg");
            } else if (fileExtension === ".png") {
                image = image.png({ quality: Math.round(quality * 0.1) });
                res.set("Content-Type", "image/png");
            } else {
                res.set("Content-Type", mimeType);
            }

            if (width && !isNaN(width)) {
                image = image.resize({ width });
            }

            buffer = await image.toBuffer();
        } else {
            buffer = fs.readFileSync(filePath);
            res.set("Content-Type", mimeType);
        }

        res.set({
            "Cache-Control": "public, max-age=3600",
            "Accept-Ranges": "bytes",
        });

        res.send(buffer);
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).send("Error processing file.");
    }
};



// export const uploadImageToGlobalServer = async (buffer, originalName, subfolder = 'group-profile') => {
//     try {
//         const form = new FormData();
//         form.append('image', buffer, {
//             filename: originalName,
//             contentType: 'image/png', // or dynamic type if you know it
//         });
//         form.append('subfolder', subfolder);

//         const response = await axios.post(`${process.env.IMG_URL}/upload`, form, {
//             headers: form.getHeaders()
//         });

//         return response.data; // Expected: image URL
//     } catch (err) {
//         console.error('Image upload failed:', err.message);
//         throw new Error('Image Upload fail..')
//     }
// };
// export const deleteImageToGlobalServer = async (imageUrl) => {
//     try {
//         const response = await axios.delete(process.env.IMG_URL + '/deleteImage', {
//             params: { url: imageUrl }
//         });
//         // console.log('Image deleted successfully:', response.data);
//         return response.data; // { message: 'Image deleted successfully.' }
//     } catch (error) {
//         console.error('Failed to delete image:', error.message);
//         return 1
//     }
// };
const deleteQueueDir = path.join(__dirname, "uploads", "delete-queue");


export const uploadImageToGlobal = async (file, subfolder = "avatars") => {

    const uploadsDir = path.join(process.cwd(), "uploads", subfolder);

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const detectedType = await fileTypeFromBuffer(file.data);
    const mimeType = detectedType?.mime || file.mimetype;

    // 🔥 Slugify original name (without extension)
    const originalNameWithoutExt = path.parse(file.name).name;
    const slugBase = slugify(originalNameWithoutExt, {
        lower: true,
        strict: true,
        trim: true
    });

    // 🔥 Add timestamp for uniqueness
    const uniqueSuffix = Date.now();

    let fileName;
    let outputPath;

    if (mimeType.startsWith("image/")) {

        fileName = `${slugBase}-${uniqueSuffix}.webp`;
        outputPath = path.join(uploadsDir, fileName);

        await sharp(file.data)
            .webp({ quality: 90 })
            .toFile(outputPath);

    } else {

        const ext = path.extname(file.name);
        fileName = `${slugBase}-${uniqueSuffix}${ext}`;
        outputPath = path.join(uploadsDir, fileName);

        await fs.promises.writeFile(outputPath, file.data);
    }

    const stats = await fs.promises.stat(outputPath);

    return {
        name: fileName,
        url: `${process.env.IMG_URL}/image/${subfolder}/${fileName}`,
        size: stats.size
    };
};

export const uploadAdminImage = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const file = req.files.file;
        const folder = req.body.folder || "admin";

        const result = await uploadImageToGlobal(file, folder);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

cron.schedule("0 * * * *", async () => {
    try {
        const files = await fs.promises.readdir(deleteQueueDir);

        for (const file of files) {
            const fullPath = path.join(deleteQueueDir, file);

            if (file.endsWith(".json")) {
                try {
                    const content = await fs.promises.readFile(fullPath, "utf-8");
                    const parsed = JSON.parse(content);

                    try {
                        await fs.promises.unlink(parsed.path);
                    } catch (deleteErr) {
                        if (deleteErr.code === "EBUSY") {
                            console.warn(`⏳ File busy, will retry: ${parsed.path}`);
                            continue;
                        } else if (deleteErr.code === "ENOENT") {
                            console.warn(`⚠️ File not found, removing task: ${parsed.path}`);
                        } else {
                            throw deleteErr;
                        }
                    }

                    // 🧹 Remove task file
                    await fs.promises.unlink(fullPath);
                } catch (parseErr) {
                    console.error(`❌ Error processing task ${file}:`, parseErr.message);

                    const corruptedDir = path.join(deleteQueueDir, "corrupted");
                    const corruptedPath = path.join(corruptedDir, file);

                    await fs.promises.mkdir(corruptedDir, { recursive: true });
                    await fs.promises.rename(fullPath, corruptedPath);
                }
            } else {
                try {
                    await fs.promises.unlink(fullPath);
                } catch (err) {
                    if (err.code === "ENOENT") {
                        console.warn(`⚠️ File not found: ${file}`);
                    } else {
                        console.error(`❌ Failed to delete ${file}:`, err.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error("🚨 Error in deletion cron job:", err);
    }
});
