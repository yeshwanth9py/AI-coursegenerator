const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    creator: { type: String, required: true }, // Auth0 sub or your user id
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);