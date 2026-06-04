const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

// POST /api/courses
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;

    const course = await Course.create({
      title,
      description,
      tags: tags || [],
      creator: req.user.sub || req.user._id, // Auth0 sub or your user id
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/mine
exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ creator: req.user.sub || req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:courseId (populate modules + lessons)
exports.getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
    .populate({
        path: "modules",
        populate: { path: "lessons" },
    });
    console.log("Fetching course with ID:", course);

    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.creator != req.user.sub && course.creator != req.user._id) return res.status(403).json({ message: "Forbidden" });

    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    next(err);
  }
};

// POST /api/courses/:courseId/modules
exports.addModuleToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.creator != req.user.sub && course.creator != req.user._id) return res.status(403).json({ message: "Forbidden" });

    const moduleDoc = await Module.create({ title, course: course._id });

    course.modules.push(moduleDoc._id);
    await course.save();

    res.status(201).json(moduleDoc);
  } catch (err) {
    next(err);
  }
};

// POST /api/courses/modules/:moduleId/lessons
exports.addLessonToModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { title, content } = req.body;

    const moduleDoc = await Module.findById(moduleId).populate("course");
    if (!moduleDoc) return res.status(404).json({ message: "Module not found" });

    // check ownership via course.creator
    const course = await Course.findById(moduleDoc.course._id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.creator != req.user.sub && course.creator != req.user._id) return res.status(403).json({ message: "Forbidden" });

    const lesson = await Lesson.create({
      title,
      content: content || [],
      module: moduleDoc._id,
    });

    moduleDoc.lessons.push(lesson._id);
    await moduleDoc.save();

    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:courseId  (cascade delete)
exports.deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.creator != req.user.sub && course.creator != req.user._id) return res.status(403).json({ message: "Forbidden" });

    const modules = await Module.find({ course: course._id });
    const moduleIds = modules.map((m) => m._id);

    await Lesson.deleteMany({ module: { $in: moduleIds } });
    await Module.deleteMany({ course: course._id });
    await Course.deleteOne({ _id: course._id });

    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};