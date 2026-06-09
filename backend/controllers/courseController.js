const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

function sanitizeText(value, maxLength = 1000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function ownsCourse(course, user) {
  return String(course.creator) === String(user._id);
}

function normalizeContentBlock(block) {
  if (!block || typeof block !== "object") return null;

  if (block.type === "heading") {
    const text = sanitizeText(block.text, 300);
    return text ? { type: "heading", level: Number(block.level) === 3 ? 3 : 2, text } : null;
  }

  if (block.type === "paragraph") {
    const text = sanitizeText(block.text, 5000);
    return text ? { type: "paragraph", text } : null;
  }

  if (block.type === "code") {
    const code = sanitizeText(block.code, 10000);
    return code
      ? { type: "code", language: sanitizeText(block.language, 40) || "text", code }
      : null;
  }

  if (block.type === "video") {
    const url = sanitizeText(block.url || block.src, 1000);
    return url
      ? { type: "video", url, title: sanitizeText(block.title || block.text, 300) || "Video" }
      : null;
  }

  return null;
}

exports.createCourse = async (req, res, next) => {
  try {
    const title = sanitizeText(req.body?.title, 160);
    const description = sanitizeText(req.body?.description, 600);
    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags.map((tag) => sanitizeText(tag, 40)).filter(Boolean).slice(0, 5)
      : [];

    if (!title) {
      return res.status(400).json({ error: "Course title is required" });
    }

    const course = await Course.create({
      title,
      description,
      tags,
      creator: req.user._id,
    });

    return res.status(201).json(course);
  } catch (error) {
    return next(error);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ creator: req.user._id }).sort({ createdAt: -1 });
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate({
      path: "modules",
      populate: { path: "lessons" },
    });

    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!ownsCourse(course, req.user)) return res.status(403).json({ error: "Forbidden" });

    return res.json(course);
  } catch (error) {
    return next(error);
  }
};

exports.addModuleToCourse = async (req, res, next) => {
  try {
    const title = sanitizeText(req.body?.title, 160);
    if (!title) return res.status(400).json({ error: "Module title is required" });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!ownsCourse(course, req.user)) return res.status(403).json({ error: "Forbidden" });

    const moduleDoc = await Module.create({ title, course: course._id });
    course.modules.push(moduleDoc._id);
    await course.save();

    return res.status(201).json(moduleDoc);
  } catch (error) {
    return next(error);
  }
};

exports.addLessonToModule = async (req, res, next) => {
  try {
    const title = sanitizeText(req.body?.title, 160);
    if (!title) return res.status(400).json({ error: "Lesson title is required" });

    const moduleDoc = await Module.findById(req.params.moduleId).populate("course");
    if (!moduleDoc) return res.status(404).json({ error: "Module not found" });
    if (!moduleDoc.course) return res.status(404).json({ error: "Course not found" });
    if (!ownsCourse(moduleDoc.course, req.user)) return res.status(403).json({ error: "Forbidden" });

    const content = Array.isArray(req.body?.content)
      ? req.body.content.map(normalizeContentBlock).filter(Boolean)
      : [];

    const lesson = await Lesson.create({ title, content, module: moduleDoc._id });
    moduleDoc.lessons.push(lesson._id);
    await moduleDoc.save();

    return res.status(201).json(lesson);
  } catch (error) {
    return next(error);
  }
};

exports.addContentBlock = async (req, res, next) => {
  try {
    const block = normalizeContentBlock(req.body?.block);
    if (!block) return res.status(400).json({ error: "A valid content block is required" });

    const lesson = await Lesson.findById(req.params.lessonId).populate({
      path: "module",
      populate: { path: "course" },
    });

    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    if (!lesson.module?.course) {
      return res.status(404).json({ error: "Lesson is not attached to a valid course" });
    }
    if (!ownsCourse(lesson.module.course, req.user)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    lesson.content.push(block);
    lesson.markModified("content");
    await lesson.save();

    return res.json(lesson);
  } catch (error) {
    return next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!ownsCourse(course, req.user)) return res.status(403).json({ error: "Forbidden" });

    const modules = await Module.find({ course: course._id }).select("_id");
    const moduleIds = modules.map((moduleDoc) => moduleDoc._id);

    await Lesson.deleteMany({ module: { $in: moduleIds } });
    await Module.deleteMany({ course: course._id });
    await course.deleteOne();

    return res.json({ message: "Course deleted" });
  } catch (error) {
    return next(error);
  }
};
