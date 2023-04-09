const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { default: mongoose } = require('mongoose');
const Testimonial = require('../models/testimonialSchema');
const { uploadProfileImageToS3 } = require('../utils/aws');
const { checkErr } = require('../utils/error');

// Create a new testimonial
router.post('/add', uploadProfileImageToS3('testimonial').fields([{ name: 'image' }, { name: 'companyLogo' }]), [
    body('name', 'Please provide a valid name').notEmpty().isString(),
    body('description', 'Please provide a valid description').notEmpty().isString()
], checkErr, async (req, res) => {
    const { name, description } = req.body;
    const testimonial = new Testimonial({ name, description });
    if (req.files) {
        if (req.files.image) testimonial.image = req.files.image[0].location;
        if (req.files.companyLogo) testimonial.companyLogo = req.files.companyLogo[0].location;
    }
    await testimonial.save();
    return res.status(201).json({ issuccess: true, data: testimonial, message: 'Testimonial added successfully' });
});

// Read all testimonials
router.get('/', async (req, res) => {
    const testimonials = await Testimonial.find();
    return res.status(200).json({ issuccess: true, data: testimonials, message: 'Testimonials found' });
});

// Read one testimonial
router.get('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid member id');
    }
    const course = await teamMember.findById(value);
    if (!course) {
        throw new Error('team member not found');
    }
})], checkErr, async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
        return res.status(404).json({ issuccess: false, data: null, message: 'Testimonial not found' });
    }
    return res.status(200).json({ issuccess: true, data: testimonial, message: 'Testimonial found' });
});

// Update a testimonial
router.put('/:id', uploadProfileImageToS3('testimonial').fields([{ name: 'image' }, { name: 'companyLogo' }]), [
    body('name').notEmpty().isString(),
    body('description').notEmpty().isString(),
    param('id').custom(async (value) => {
        if (!mongoose.isValidObjectId(value)) {
            throw new Error('Invalid testimonial ID');
        }
        const testimonial = await Testimonial.findById(value);
        if (!testimonial) {
            throw new Error('Testimonial not found');
        }
    })
], checkErr, async (req, res) => {
    const { name, description } = req.body;
    console.log(req.params.id)
    const testimonial = await Testimonial.findById(req.params.id);
    let update = await Testimonial.findByIdAndUpdate(req.params.id, {
        name,
        description,
        image: req.files && req.files.image ? req.files.image[0].location : testimonial.image,
        companyLogo: req.files && req.files.companyLogo ? req.files.companyLogo[0].location : testimonial.companyLogo
    }, { new: true });
    return res.status(200).json({ issuccess: true, data: update, message: 'Testimonial updated successfully' });
});

// Delete a testimonial
router.delete('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid testimonial ID');
    }
    const testimonial = await Testimonial.findById(value);
    if (!testimonial) {
        throw new Error('Testimonial not found');
    }
})], checkErr, async (req, res) => {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
    }
    return res.status(200).json({ issuccess: true, data: testimonial, message: 'Testimonial deleted successfully' });
});

module.exports = router;
