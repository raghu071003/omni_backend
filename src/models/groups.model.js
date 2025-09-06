const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    organization_id:{
        type:String,
        required:true,
        ref:"Organization"
    },
    team_id:{
        type:String,
        required:true,
        ref:"Team"
    },
    sub_team_id:{
        type:String,
        required:true,
        ref:"SubTeam"
    }
})

const Group = mongoose.model("Group",groupSchema)
module.exports = Group

