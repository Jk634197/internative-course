const express = require("express");

const { default: mongoose, mongo } = require("mongoose");
const router = express.Router();
const multer = require("multer");
const Course = require("../models/courseSchema");
const Modules = require("../models/modulesSchema");
const Question = require("../models/questionSchema");
const { uploadProfileImageToS3 } = require("../utils/aws");
const { addModules, addQuestions } = require("../utils/crudmoduels");

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG files are allowed!"), false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
    },
    fileFilter: fileFilter,
});

router.post('/', uploadProfileImageToS3('courses').fields([{ name: 'careerPathImage', maxCount: 1 }, { name: 'technologies', maxCount: 10 }])
    , [], async (req, res) => {
        try {
            const { title, description, tagline, duration, roadMap, isShort, questions, modules } = req.body;
            const techImageFiles = req.files["technologies"];
            if (!Array.isArray(techImageFiles) || techImageFiles.length === 0) {
                return res
                    .status(400)
                    .json({ isSuccess: false, message: "No technology images provided." });
            }
            const technologies = techImageFiles.map(file => file.location);

            // Validate career path image
            const careerPathImage = req.files["careerPathImage"][0].location;
            if (!careerPathImage) {
                return res
                    .status(400)
                    .json({ isSuccess: false, message: "No career path image provided." });
            }
            const course = new Course({
                title,
                description,
                tagline,
                duration,
                roadMap,
                technologies,
                careerPathImage,
                isShort
            });
            await course.save();
            await addModules(modules, course._id);
            await addQuestions(questions, course._id);
            return res.status(201).json({
                success: true,
                data: course,
                message: 'Course created successfully'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Failed to create course'
            });
        }
    });
router.get('/', async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: 'questions',
                    let: { courseId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }],
                    as: 'questionsData'
                }
            },
            {
                $lookup: {
                    from: 'modules',
                    let: { courseId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }],
                    as: 'modulesData'
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            data: courses,
            message: 'Courses found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to find courses'
        });
    }
});
router.get('/web', async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: 'questions',
                    let: { courseId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } },
                        {
                            $project: {
                                answer: 0,
                                __v: 0
                            }
                        },
                        { $sample: { size: 9999 } }, // replace 9999 with the number of documents in the collection
                        { $sort: { randomField: 1 } } // replace randomField with the name of a field with random values
                    ],
                    as: 'questionsData'
                }
            },

            {
                $lookup: {
                    from: 'modules',
                    let: { courseId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }, {
                        $project: {
                            answer: 0,
                            __v: 0
                        }
                    }],
                    as: 'modulesData'
                }
            },
            {
                $project: { __v: 0 }
            }
        ]);
        return res.status(200).json({
            success: true,
            data: courses,
            message: 'Courses found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to find courses'
        });
    }
});
router.get('/web-list', async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json({
            success: true,
            data: courses,
            message: 'Courses found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to find courses'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        const courses = await Course.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'questions',
                    let: { courseId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }, {
                        $project: {
                            answer: 0,
                            __v: 0
                        }
                    }],
                    as: 'questionsData'
                }
            },
            {
                $lookup: {
                    from: 'modules',
                    let: { courseId: '$_id' },
                    pipeline: [{ $match: { $expr: { $eq: ["$courseId", "$$courseId"] } } }, {
                        $project: {
                            answer: 0,
                            __v: 0
                        }
                    }],
                    as: 'modulesData'
                }
            },
            {
                $project: { __v: 0 }
            }
        ]);
        return res.status(200).json({
            success: true,
            data: courses,
            message: 'Courses found'
        });
        return res.status(200).json({
            success: true,
            data: course,
            message: 'Course found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to find course'
        });
    }
});
router.put('/', uploadProfileImageToS3('courses').fields([{ name: 'careerPathImage', maxCount: 1 }, { name: 'technologies', maxCount: 10 }])
    , [], async (req, res) => {
        try {
            const { title, description, tagline, duration, roadMap, isShort, questions, modules, courseId } = req.body;
            const getCourse = await Course.findById(courseId);
            if (getCourse == undefined || getCourse == null) {
                return res.status(404).json({ isSuccess: false, data: null, message: "no course found" });

            }
            let technologies, careerPathImage;
            if ('technologies' in req.files && req.files.technologies.length > 0) {
                const techImageFiles = req.files["technologies"];
                if (!Array.isArray(techImageFiles) || techImageFiles.length === 0) {
                    return res
                        .status(400)
                        .json({ isSuccess: false, data: null, message: "No technology images provided." });
                }
                technologies = techImageFiles.map(file => file.location);
            }
            // Validate career path image
            if ('careerPathImage' in req.files && req.files.careerPathImage.length > 0) {
                careerPathImage = req.files["careerPathImage"][0].location;
                if (!careerPathImage) {
                    return res
                        .status(400)
                        .json({ isSuccess: false, data: null, message: "No career path image provided." });
                }
            }
            const course = await Course.findByIdAndUpdate(courseId, {
                title: title,
                description: description,
                tagline: tagline,
                duration: duration,
                roadMap: roadMap,
                technologies: technologies,
                careerPathImage: careerPathImage,
                isShort: isShort
            }, { new: true })
            if (modules != undefined && Array.isArray(modules)) {

                await addModules(modules, course._id);
            }
            if (questions != undefined && Array.isArray(questions)) {

                await addQuestions(questions, course._id);
            }
            return res.status(201).json({
                success: true,
                data: course,
                message: 'Course created successfully'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: error.message,
                message: 'Failed to create course'
            });
        }
    });
module.exports = router;