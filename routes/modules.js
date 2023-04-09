const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Modules = require('../models/modulesSchema');
const Course = require('../models/courseSchema');

// Get all modules
router.get('/modules', async (req, res) => {
    try {
        const modules = await Modules.find().populate('courseId', 'title');
        res.json(modules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a single module by ID
router.get('/modules/:id', async (req, res) => {
    try {
        const module = await Modules.findById(req.params.id).populate('courseId', 'title');
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(module);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new module
router.post('/modules', [
    body('title').notEmpty().withMessage('Title is required'),
    body('modules').isArray({ min: 1 }).withMessage('At least one module is required'),
    body('courseId').custom(async (value) => {
        if (!mongoose.isValidObjectId(value)) {
            throw new Error('Invalid course ID');
        }
        const course = await Course.findById(value);
        if (!course) {
            throw new Error('Course not found');
        }
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const module = new Modules({
            title: req.body.title,
            modules: req.body.modules,
            courseId: req.body.courseId
        });
        await module.save();
        res.json({ message: 'Module created successfully', module });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a module by ID
router.put('/modules/:id', [
    body('title').notEmpty().withMessage('Title is required'),
    body('modules').isArray({ min: 1 }).withMessage('At least one module is required'),
    body('courseId').custom(async (value) => {
        if (!mongoose.isValidObjectId(value)) {
            throw new Error('Invalid course ID');
        }
        const course = await Course.findById(value);
        if (!course) {
            throw new Error('Course not found');
        }
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const module = await Modules.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            modules: req.body.modules,
            courseId: req.body.courseId
        }, { new: true });
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json({ message: 'Module updated successfully', module });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const module = await Modules.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }

        await module.remove();
        res.json({ message: 'Module deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;