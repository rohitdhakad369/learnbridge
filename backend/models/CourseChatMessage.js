const mongoose = require("mongoose")

const courseChatMessageSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  mentions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      mentionTag: {
        type: String,
        required: true,
        trim: true,
      },
      displayName: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  isPinned: {
    type: Boolean,
    default: false,
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 48,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

courseChatMessageSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("CourseChatMessage", courseChatMessageSchema)
