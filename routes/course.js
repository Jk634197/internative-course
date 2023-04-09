const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Course = require('../models/courseSchema');
const modulesSchema = require('../models/modulesSchema');
const questionSchema = require('../models/questionSchema');
// Create a new course
router.post('/courses', [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tagline').notEmpty().withMessage('Tagline is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('roadMap').notEmpty().withMessage('Roadmap is required'),
    body('careerPathImage').notEmpty().withMessage('Career path image is required'),
    body('isShort').notEmpty().isBoolean().withMessage('please pass isShort'),
    body('questions').isArray().withMessage('questions should be array'),
    body('modules').isArray().withMessage('module should be array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ issuccess: false, data: errors.array(), message: 'not valid parameter' });
    }

    try {
        const course = new Course(req.body);
        await course.save();
        const { questions, modules } = req.body;
        for (i = 0; i < questions.length; i++) {
            await new questionSchema(Object.assign(questions[i], { courseId: course._id })).save();
        }
        for (i = 0; i < modules.length; i++) {
            await new modulesSchema(Object.assign(modules[i], { courseId: course._id })).save();
        }
        res.status(201).json({ issuccess: true, data: course, message: 'course added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ issuccess: false, data: null, message: err.message || 'Server error' });
    }
});

// Read all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Read one course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a course
router.put('/courses/:id', [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('tagline').notEmpty().withMessage('Tagline is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('roadMap').notEmpty().withMessage('Roadmap is required'),
    body('careerPathImage').notEmpty().withMessage('Career path image is required'),
    body('questions').isArray().withMessage('questions should be array'),
    body('modules').isArray().withMessage('module should be array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ issuccess: false, data: errors.array(), message: 'not valid parameter' });
    }

    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const { questions, modules } = req.body;
        await questionSchema.deleteMany({ courseId: req.param.id })
        await questionSchema.deleteMany({ courseId: req.param.id })
        for (i = 0; i < questions.length; i++) {
            await new questionSchema(Object.assign(questions[i], { courseId: course._id })).save();
        }
        for (i = 0; i < modules.length; i++) {
            await new modulesSchema(Object.assign(modules[i], { courseId: course._id })).save();
        }
        return res.status(200).json({ issuccess: true, data: course, message: 'course added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a course
router.delete('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
