const mongoose = require('mongoose');
const testimonialSchema = mongoose.Schema({
    image: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    companyLogo: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("testimonial", testimonialSchema);