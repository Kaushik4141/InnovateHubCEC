import { Post, Video } from "../models/post.model.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { deleteFile, uploadOnCloudnary } from "../utils/cloudinary.js";
import { asynHandler } from "../utils/asynchandler.js";
const postUpload = asynHandler(async (req, res) => {
  try {
    const { description } = req.body;
    const userid = req.user._id;
    const postFileLocalPath = req.files?.postFile?.[0]?.path;
    if (!videoFileLocalPath) throw new ApiError(400, "Video file required");
    
    const uploadPostOnCloudinary = await uploadOnCloudnary(postFileLocalPath);
   
    if (!(uploadPostOnCloudinary))
      throw new ApiError(400, "Upload video error");
    const postPublish = await Post.create({
      postFile: uploadPostOnCloudinary.url,
      description,
      cloudinaryPostID: uploadVideoOnCloudinary.public_id,
      owner: userid,
    });
    if (!postPublish)
      throw ApiError(500, "Something went wrong while uploading");
    return res
      .status(200)
      .json(new ApiResponse(200, { postPublish }, "Success"));
  } catch (e) {
    throw new ApiError(400, e.message);
  }
});

const getAllPost = asynHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
  }
  try {
    const result = await Post.aggregate([
      {
        $match: {
          $or: [
            { description: { $regex: query, $options: "i" } },
          ],
          owner: userId,
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      },
    ]);
    return res.status(200).json(new ApiResponse(200, { result }, "Success"));
  } catch (e) {
    throw new ApiError(500, e.message);
  }
});
const getVideoById = asynHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const postUrl = await Post.findById(postId);
    if (!postUrl) throw new ApiError(404, "post not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { videoUrl }, "Success file "));
  } catch (e) {
    throw new ApiError(404, e.message);
  }
});
const updatePost = asynHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const localFilePathofPost = req.file.path;

    if (!localFilePathofPost) {
      throw new ApiError(404, "File not found");
    }

    const uploadCloud = await uploadOnCloudnary(localFilePathofPost);

    if (!uploadCloud.url) {
      throw new ApiError(500, "Unable to upload to cloud");
    }
    const public_id_post = await Post.findById(postId);
    const deleteFileServer = await deleteFile(
      public_id_post.cloudinaryPostID
    );

    console.log("Filed  file deleted", deleteFileServer);
    const uploadfileonServer = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          postFile: uploadCloud.url,
          cloudinaryPostID: uploadCloud.public_id,
        },
      },
      { new: true }
    );
    if (!uploadfileonServer)
      throw new ApiError(500, "Unable to update post on server");
    return res
      .status(200)
      .json(new ApiResponse(200, { uploadfileonServer }, "Success"));
  } catch (e) {
    throw new ApiError(500, "Error uploading: " + e.message);
  }
});
const deletePost = asynHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const public_id_video = await Post.findById(postId);

    if (!public_id_post) {
      throw new ApiError(404, "Post not found");
    }

    const cloudinaryPostID = public_id_post.cloudinaryPostID;

    const deleteFileServer = await deleteFile(cloudinaryVideoID);

    if (!deleteFileServer.result || deleteFileServer.result !== "ok") {
      throw new ApiError(500, "Unable to delete file on Cloudinary");
    }

    const uploadfileonServer = await Post.findByIdAndDelete(postId);

    if (!uploadfileonServer) {
      throw new ApiError(500, "Unable to delete post on server");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { uploadfileonServer }, "Success"));
  } catch (e) {
    throw new ApiError(500, "Error deleting: " + e.message);
  }
});

const togglePublishStatus = asynHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const toggel = await Post.findOneAndUpdate({ _id: postId }, [
      { $set: { isPublished: { $not: "$isPublished" } } },
    ]);
    return res.status(200).json(new ApiResponse(200, { toggel }, "Updated"));
  } catch (e) {
    throw new ApiError(400, e.message || "Unable to update post");
  }
});
export {
  postUpload,
  getPostById,
  updatePost,
  deletePost,
  togglePublishStatus,
  getAllPost,
};