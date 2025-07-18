import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath)
        return null;
    }
}
const deleteFile = async (publicid) => {
  try {
    if (!publicid) return "Public id not found";
    const deletresponse = await cloudinary.uploader.destroy(publicid, {
      resource_type: "auto",
    });
    return deletresponse;
  } catch (e) {
    return e.message;
  }
}
export {uploadOnCloudinary, deleteFile};