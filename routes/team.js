const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { default: mongoose } = require('mongoose');
const Course = require('../models/courseSchema');
const modulesSchema = require('../models/modulesSchema');
const questionSchema = require('../models/questionSchema');
const teamMember = require('../models/teamMember');
const { uploadProfileImageToS3 } = require('../utils/aws');
const { checkErr } = require('../utils/error');
// Create a new course
router.post('/add', uploadProfileImageToS3('team').single('image'), [
    body('role', 'please pass valid role').notEmpty().isString().withMessage('please pass role'),
    body('name', 'please pass valid name').notEmpty().isString().withMessage('please pass name'),
], checkErr, async (req, res) => {
    const { name, role } = req.body;
    const course = new teamMember({ name: name, role: role, image: req.file.location })
    await course.save();
    return res.status(201).json({ issuccess: true, data: course, message: 'team member added' });
});

// Read all courses
router.get('/', async (req, res) => {
    const courses = await teamMember.find();
    return res.status(201).json({ issuccess: true, data: courses, message: 'team member found' });

});

// Read one course
router.get('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid member id');
    }
    const course = await teamMember.findById(value);
    if (!course) {
        throw new Error('team member not found');
    }
})], checkErr, async (req, res) => {
    const course = await teamMember.findById(req.params.id);
    if (!course) {
        return res.status(404).json({ issuccess: false, data: course, message: 'team member not found' });
    }
    return res.status(201).json({ issuccess: true, data: course, message: 'team member found' });
});

// Update a course
router.put('/:id', uploadProfileImageToS3('team').single('image'), [
    body('role').notEmpty().isString().withMessage('please pass role'),
    body('name').notEmpty().isString().withMessage('please pass name'),
    param('id').custom(async (value) => {
        if (!mongoose.isValidObjectId(value)) {
            throw new Error('Invalid member id');
        }
        const course = await teamMember.findById(value);
        if (!course) {
            throw new Error('team member not found');
        }
    })
], checkErr, async (req, res) => {
    const { role, name } = req.body;

    const team = await teamMember.findById(req.params.id);
    let update = await teamMember.findByIdAndUpdate(req.params.id, { name, role, image: req.file != undefined ? req.file.location : team.image }, { new: true });
    return res.status(200).json({ issuccess: true, data: update, message: 'team updated successfully' });

});

// Delete a course
router.delete('/:id', [param('id').custom(async (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error('Invalid member id');
    }
    const course = await teamMember.findById(value);
    if (!course) {
        throw new Error('team member not found');
    }
})], checkErr, async (req, res) => {
    const course = await teamMember.findByIdAndDelete(req.params.id);
    if (!course) {
        return res.status(404).json({ error: 'member details not found' });
    }
    return res.status(201).json({ issuccess: true, data: course, message: 'team member removed' });

});

module.exports = router;
