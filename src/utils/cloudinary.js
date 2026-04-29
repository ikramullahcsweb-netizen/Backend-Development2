import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

cloudinary.config({ 
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    // api_key: process.env.CLOUDINARY_API_KEY, 
    // api_secret: process.env.CLOUDINARY_API_SECRET 
    cloud_name: "dexpxihxt", 
    api_key: "881431749815847", 
    api_secret: "lQGZM71WhFnluottfFTt0LSegWg" 
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null;
     

        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto",
             timeout: 120000,
        });

        // File successfully upload ho gayi
        console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(localPath); // Local file delete karein
        return response;

    } catch (error) {
        // Agar file exist karti hai to hi delete karein
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

export { uploadOnCloudinary };
