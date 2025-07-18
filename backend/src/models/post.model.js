import e from "express";
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const postSchema = new mongoose.Schema({
  postFile: {
      type: String,
      required: true,
      unique: true,
    },
  description: {
    type: String,
    required: true
  },
 views: {
    type: Number,
    default: 0
  },
  ispublished: {
    type: Boolean,
    default: true
  },
 owner: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User",
    required: true
    },
    tags: [{
        type: String,
        trim: true
        }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    commentlikes: [{
      type: mongoose.Schema.Types.ObjectId,
        ref: "User"
  }]
    }]
},
{ timestamps: true }
);

postSchema.plugin(mongooseAggregatePaginate);
export const Post = mongoose.model("Post", postSchema);