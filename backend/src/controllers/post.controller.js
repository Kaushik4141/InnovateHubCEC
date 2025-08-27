import { Post} from "../models/post.model.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { deleteFile, uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";

const postUpload = asyncHandler(async (req, res) => {
  try {
    const { description, liveLink, githubLink } = req.body;
    const userid = req.user._id;
    const files = req.files?.postFile;
    if (!files || files.length === 0) throw new ApiError(400, "Post file(s) required");
    
    const uploadedUrls = [];
    for (const file of files) {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (!uploadResult) throw new ApiError(400, "Upload error");
      uploadedUrls.push(uploadResult.url);
    }
    const postPublish = await Post.create({
      postFile: uploadedUrls,
      description,
      liveLink: liveLink || undefined,
      githubLink: githubLink || undefined,
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
  const { page = 1, limit = 10, query, userId } = req.query;
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
    // Use $sample to randomize posts
    pipeline.push({ $sample: { size: parseInt(limit) } });
    pipeline.push(
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
    const total = await Post.countDocuments(match);
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

const getSuggestedPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const userSkills = user.skills || [];

    const match = {
      owner: { $ne: userId },
      ispublished: true,
      ...(userSkills.length > 0 ? { tags: { $in: userSkills } } : {})
    };

    const posts = await Post.find(match)
      .sort({ likes: -1, views: -1, createdAt: -1 })
      .limit(10)
      .populate('owner', 'fullname avatar skills');

    return res.status(200).json(
      new ApiResponse(200, posts, "Suggested posts fetched successfully")
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
  getPostByUserId,
  getSuggestedPosts
};