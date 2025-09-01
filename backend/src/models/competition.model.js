import mongoose from "mongoose";

const CompetitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    aplliedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    applicationCount: {
        type: Number,
        default: 0
    }


}, { timestamps: true });

export const Competition = mongoose.model("Competition", CompetitionSchema);
