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
    teamsize: {
        type : String
    },
    Prize:{
        type: String,
        default:0
    },
    startDate: {
        type: String,
        required: true
    },
    Tag:{
        type: String,
        required:true
    },
    Reqirements:{
        type:String,
        required:true
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
    isTeamEvent: {
        type: Boolean,
        default: false
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
