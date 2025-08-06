import { Post} from "../models/post.model.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { deleteFile, uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asynchandler.js";

const postUpload = asyncHandler(async (req, res) => {
  try {
    const { description } = req.body;
    const userid = req.user._id;
    const postFileLocalPath = req.files?.postFile?.[0]?.path;
    if (!postFileLocalPath) throw new ApiError(400, "Post file required");
    
    const uploadPostOnCloudinary = await uploadOnCloudinary(postFileLocalPath);
   
    if (!(uploadPostOnCloudinary))
      throw new ApiError(400, "Upload video error");
    const postPublish = await Post.create({
      postFile: uploadPostOnCloudinary.url,
      description,
      cloudinaryPostID: uploadPostOnCloudinary.public_id,
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

const getAllPost = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
  }
  try {
    const match = {};
    if (query) {
      match.description = { $regex: query, $options: "i" };
    }
    if (userId) {
      match.owner = userId;
    }
    const pipeline = [];
    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }
    if (sortBy) {
      pipeline.push({ $sort: sortOptions });
    }
    pipeline.push(
  { $skip: (parseInt(page) - 1) * parseInt(limit) },
  { $limit: parseInt(limit) },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner"
    }
  },
  { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } }
    );
    const result = await Post.aggregate(pipeline);
    const total = await Post.countDocuments();
    return res.status(200).json(new ApiResponse(200, { result, total }, "Success"));
  } catch (e) {
    throw new ApiError(500, e.message);
  }
});
const getPostById = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const postUrl = await Post.findById(postId);
    if (!postUrl) throw new ApiError(404, "post not found");

    return res
      .status(200)
      .json(new ApiResponse(200, { postUrl }, "Success file "));
  } catch (e) {
    throw new ApiError(404, e.message);
  }
});
const updatePost = asyncHandler(async (req, res) => {
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
const deletePost = asyncHandler(async (req, res) => {
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

const togglePublishStatus = asyncHandler(async (req, res) => {
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
const getPostByUserId = asyncHandler(async (req, res) => {
 try {
    const posts = await Post.find({ owner: req.params.userId });
    res.json(posts);
  } catch (e) {
    throw new ApiError(500, e.message|| "Failed to fetch posts for user");
  }
});


import { LinkedinPost } from "../models/linkedinpost.model.js";

const getCombinedPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ owner: userId }).sort({ createdAt: -1 });
    const linkedinPosts = await LinkedinPost.find({ owner:userId }).sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, { posts, linkedinPosts }, "Combined posts fetched successfully")
    );
  } catch (e) {
    throw new ApiError(500, e.message);
  }
});

export {
  postUpload,
  getPostById,
  updatePost,
  deletePost,
  togglePublishStatus,
  getAllPost,
  getCombinedPosts,
  getPostByUserId
};