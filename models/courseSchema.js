const mongoose = require('mongoose');
const courseSchema = mongoose.Schema({
    title: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    homeDesc: {
        type: String,
        default: ""
    },
    tagline: {
        type: String,
        default: ''
    },
    tagline1: {
        type: String,
        default: ''
    },
    duration: {
        type: Number,
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
    price: {
        type: Number,
        default: 0
    },
    isShort: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("course", courseSchema);