import { LinkedinPost } from "../models/linkedinpost.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import axios from "axios";
import { ApiResponse } from "../utils/apiresponsehandler.js";
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_RUN_URL = `https://api.apify.com/v2/acts/${process.env.APIFY_ACTOR_ID}/runs?token=${APIFY_TOKEN}`;
const APIFY_DATASET_URL = `https://api.apify.com/v2/datasets/${process.env.APIFY_DATASET_ID}/items?token=${APIFY_TOKEN}`;

const linkpostUpload = asyncHandler(async (req, res) => {
  try {
    const  username = req.user.linkedin;
    const userId = req.user._id;

    const actorInput = {
      deepScrape: false,
      limitPerSource: 10,
      rawData: false,
      urls: [username],
    };

    const runResponse = await axios.post(APIFY_RUN_URL, actorInput, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const runId = runResponse.data.data.id;

    let isFinished = false;
    let datasetId = null;
    for (let i = 0; i < 10 && !isFinished; i++) {
      const statusRes = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
        }
      );

      if (statusRes.data.data.status === "SUCCEEDED") {
        isFinished = true;
        datasetId = statusRes.data.data.defaultDatasetId;
      } else {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (!isFinished || !datasetId) {
      return res
        .status(500)
        .json({ message: "Apify scraping timeout or failed." });
    }

    const dataResponse = await axios.get(
      `https://api.apify.com/v2/datasets/${datasetId}/items`,
      {
        params: { clean: true },
        headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
      }
    );

    const scrapedData = dataResponse.data;

    const postsToSave = scrapedData.map((post) => ({
      owner: userId,
      url: post.url,
      text: post.text || "",
      images: Array.isArray(post.images)
        ? post.images.map((img) => ({ value: img }))
        : [],
      createdAt: post.date ? new Date(post.date) : new Date(),
    }));

    try {
      await LinkedinPost.insertMany(postsToSave, { ordered: false });
    } catch (err) {
      if (!(err.name === "BulkWriteError" && err.code === 11000)) {
        throw err;
      }
      console.warn("Some duplicates were skipped.");
    }
    res.status(200).json({ message: "Posts saved", count: postsToSave.length });
  } catch (err) {
    //console.error("Error in /linkedinpost:", err);
    res.status(500, err.me).json({ err: "Server error" });
  }
});
const getlinkedinPosts = asyncHandler(async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const total = await LinkedinPost.countDocuments();
    const linkedinPosts = await LinkedinPost.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "fullname avatar");

    return res.status(200).json(
      new ApiResponse(200, {
        linkedinPosts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      }, "posts fetched successfully")
    );
  } catch (e) {
    throw new ApiError(500, e.message);
  }
});


const getlinkedinPostsByUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const total = await LinkedinPost.countDocuments({ owner: userId });
    
    const linkedinPosts = await LinkedinPost.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("owner", "fullname avatar");

    return res.status(200).json(
      new ApiResponse(200, {
        linkedinPosts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      }, "User LinkedIn posts fetched successfully")
    );
  } catch (e) {
    throw new ApiError(500, e.message);
  }
});

export { linkpostUpload, getlinkedinPosts, getlinkedinPostsByUser };
