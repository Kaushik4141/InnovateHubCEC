import { Opportunity } from "../models/opportunity.model.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { ApiError } from "../utils/apierrorhandler.js";

export const bulkUpsertOpportunities = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "items array is required"));
    }

    const ops = items.map((it) => {
      const type = (it.employment_type || "").toLowerCase() === "internship" ? "internship" : "job";
      const doc = {
        job_id: it.job_id,
        title: it.title,
        company: it.company,
        location: it.location,
        employment_type: it.employment_type,
        remote: it.remote,
        salary: it.salary,
        posted_on: it.posted_on,
        skills: it.skills || [],
        good_to_have: it.good_to_have || [],
        topics: it.topics || [],
        buzzwords: it.buzzwords || [],
        rounds: it.rounds,
        cutoff: it.cutoff,
        apply_link: it.apply_link,
        description: it.description,
        type,
      };
      return {
        updateOne: {
          filter: { job_id: it.job_id },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

    const result = await Opportunity.bulkWrite(ops, { ordered: false });
    const upserts = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;

    return res
      .status(200)
      .json(new ApiResponse(200, { upserts, modified }, "opportunities upserted"));
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

export const listOpportunities = async (req, res, next) => {
  try {
    const { type = "all", q = "", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type !== "all") {
      filter.type = type;
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Opportunity.countDocuments(filter),
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, { items, total, page: pageNum, limit: limitNum }));
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};
export const listInternship = async (req, res, next) => {
  try {
    const { type = "intern", q = "", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type !== "all") {
      filter.type = type;
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Opportunity.countDocuments(filter),
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, { items, total, page: pageNum, limit: limitNum }));
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};