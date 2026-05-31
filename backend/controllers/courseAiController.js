const Groq = require("groq-sdk");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


async function getGroqStructuredResponse(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    model: "openai/gpt-oss-20b", //
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 4096
  });

  const content = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

// Generates a Course and its Modules based on a user prompt
// POST /api/courses/generate
const generateCourseContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.sub || req.user._id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // 1. Tell the AI explicitly to generate the full hierarchy (Course -> Modules -> Lessons)
    const systemPrompt = `You are an expert curriculum designer. 
    Output a JSON object containing exactly:
    - "title": A catchy title for the course.
    - "description": A short summary of what the course covers.
    - "tags": An array of up to 5 string tags.
    - "modules": An array of objects, where each module object has:
        - "title": The title of the module.
        - "lessons": An array of objects, each containing a "title" string for a lesson.`;

    // Get the structured layout from Groq
    const aiData = await getGroqStructuredResponse(systemPrompt, prompt);

    // 2. Create the base Course document
    const course = await Course.create({
      title: aiData.title,
      description: aiData.description,
      tags: aiData.tags || [],
      creator: userId,
    });

    const moduleIds = [];

    // 3. Loop through modules and deeply build out the lessons
    if (aiData.modules && Array.isArray(aiData.modules)) {
      for (const mod of aiData.modules) {
        // Create the module document first
        const newModule = await Module.create({
          title: mod.title,
          course: course._id,
        });

        const lessonIds = [];

        // Build out the lesson documents inside this specific module
        if (mod.lessons && Array.isArray(mod.lessons)) {
          for (const les of mod.lessons) {
            const newLesson = await Lesson.create({
              title: les.title,
              content: [], // Empty block content waiting for enrichment
              module: newModule._id,
            });
            lessonIds.push(newLesson._id);
          }
        }

        // Link the generated lessons back to this module
        newModule.lessons = lessonIds;
        await newModule.save();

        moduleIds.push(newModule._id);
      }
    }

    // 4. Link all generated modules back to the course
    course.modules = moduleIds;
    await course.save();

    // 5. Return the fully populated structure so you instantly see the new Lesson IDs
    const populatedCourse = await Course.findById(course._id).populate({
      path: "modules",
      populate: { path: "lessons" },
    });

    res.status(201).json(populatedCourse);

  } catch (err) {
    console.error("Error generating course content:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// POST /api/lessons/:lessonId/enrich
// Generates lesson content using the surrounding Course and Module context
// POST /api/courses/lessons/:lessonId/enrich
// POST /api/courses/lessons/:lessonId/enrich
const enrichLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.sub || req.user._id;

    // 1. Fetch the lesson and populate its hierarchy
    const lesson = await Lesson.findById(lessonId).populate({
      path: "module",
      populate: { path: "course" }
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const course = lesson.module.course;
    if (course.creator != userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 2. Clear instructions for the JSON keys
    const systemPrompt = `You are an expert educator. Create comprehensive lesson content blocks. 
    Output a JSON object containing a "contentBlocks" array.
    Each item in the array must be an object representing a content section.
    Example format:
    {
      "contentBlocks": [
        { "type": "paragraph", "text": "Deep introduction to the topic..." },
        { "type": "code", "language": "javascript", "code": "console.log('example');" }
      ]
    }`;

    const userPrompt = `Create a detailed learning curriculum with content blocks for the lesson titled "${lesson.title}". 
    This is inside the module "${lesson.module.title}" for the course "${course.title}".`;

    // 3. Get AI generation
    const aiData = await getGroqStructuredResponse(systemPrompt, userPrompt);
    
    // 4. BULLETPROOF EXTRACTION LOGIC
    // This loops through whatever mess the AI throws back (array or object) and harvests valid blocks
    let extractedBlocks = [];

    if (Array.isArray(aiData)) {
      // Handle the case where AI returns a top-level array
      aiData.forEach(item => {
        if (item && item.contentBlocks && Array.isArray(item.contentBlocks)) {
          extractedBlocks.push(...item.contentBlocks);
        } else if (item && item.type) {
          extractedBlocks.push(item);
        }
      });
    } else if (aiData && typeof aiData === "object") {
      // Handle standard object response
      const possibleArray = aiData.contentBlocks || aiData.content_blocks || aiData.blocks || aiData.content;
      if (Array.isArray(possibleArray)) {
        extractedBlocks = possibleArray;
      } else if (aiData.type) {
        extractedBlocks.push(aiData);
      }
    }

    // If we still found absolutely nothing, fail clearly instead of silently saving empty arrays
    if (extractedBlocks.length === 0) {
      console.error("Parser failed to find blocks in raw response:", aiData);
      return res.status(502).json({ error: "AI responded with an unparseable content layout." });
    }

    // 5. Update and explicitly force Mongoose to recognize the Mixed array change
    lesson.content = extractedBlocks;
    lesson.isEnriched = true;
    lesson.markModified("content"); 
    
    await lesson.save();

    res.json(lesson);

  } catch (err) {
    console.error("Error enriching lesson:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { generateCourseContent, enrichLesson };