const mongoose = require('mongoose');
const courseSchema = mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    tagline: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        default: ''
    },
    roadMap: {
        type: String,
        default: ''
    },
    careerPathImage: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    technologies: [String],
    isShort: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("course", courseSchema);