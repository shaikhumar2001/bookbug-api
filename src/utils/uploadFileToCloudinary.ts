// import path from "node:path";
// import fs from "node:fs";
// import cloudinary from "../config/cloudinary";
// import createHttpError from "http-errors";
// import { FileType } from "../book/bookTypes";

// const uploadFileToCloudinary = async (file: object) => {

//     try {
//         const coverImageFileName = file.filename;
//         const coverImageFilePath = path.resolve(
//             __dirname,
//             "../../public/data/uploads",
//             coverImageFileName
//         );
//         const coverImageMimeType = fileRequest.fileName[0].mimetype
//             .split("/")
//             .at(-1);

//         const coverImageUploadResult = await cloudinary.uploader.upload(
//             coverImageFilePath,
//             {
//                 resource_type: "raw",
//                 filename_override: coverImageFileName,
//                 folder: "book-covers",
//                 format: coverImageMimeType,
//             }
//         );

//         // Delete temp files
//         try {
//             await fs.promises.unlink(coverImageFilePath);
//         } catch (err) {
//             return next(
//                 createHttpError(500, "Error while deleting temporary files")
//             );
//         }
//     } catch (err) {
//         return next(createHttpError(500, "Error while uploading files"));
//     }
// };

// export default uploadFileToCloudinary;
