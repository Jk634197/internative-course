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
    }
}, { timestamps: true });

module.exports = mongoose.model("team", teamMember);