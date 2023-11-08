const mongoose = require('mongoose');
const teamMember = mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    position:{
        type:Number,
        default:0,
    },
    visibility:{
        type:Boolean,
        default:false
    },
}, { timestamps: true });

module.exports = mongoose.model("team", teamMember);