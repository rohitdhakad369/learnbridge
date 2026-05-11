const Course = require("../models/Course")
const CourseChatMessage = require("../models/CourseChatMessage")
const User = require("../models/User")

const senderDetails = {
  path: "sender",
  select: "firstName lastName image email accountType",
}

const mentionsDetails = {
  path: "mentions.user",
  select: "firstName lastName image email accountType",
}

const chatMessagePopulateOptions = [senderDetails, mentionsDetails]

const getCourseAccessDetails = async (courseId, userId) => {
  const course = await Course.findById(courseId).select(
    "courseName instructor studentsEnroled"
  )

  if (!course) {
    return null
  }

  const isInstructor = course.instructor.toString() === userId
  const isEnrolledStudent = course.studentsEnroled.some(
    (studentId) => studentId.toString() === userId
  )

  return {
    course,
    isInstructor,
    isEnrolledStudent,
    canAccess: isInstructor || isEnrolledStudent,
  }
}

const getMentionableStudents = async (studentIds) => {
  return User.find(
    {
      _id: { $in: studentIds },
    },
    "firstName lastName email image accountType"
  )
    .sort({ firstName: 1, lastName: 1 })
    .lean()
}

const normalizeMentions = (mentions) => {
  if (!Array.isArray(mentions)) {
    return []
  }

  return mentions
    .map((mention) => ({
      userId: mention?.userId?.toString().trim(),
      mentionTag: mention?.mentionTag?.toString().trim(),
    }))
    .filter((mention) => mention.userId && mention.mentionTag)
}

const buildMentionPayload = async ({ mentions, message, accessDetails }) => {
  const normalizedMentions = normalizeMentions(mentions)

  if (normalizedMentions.length === 0) {
    return []
  }

  if (!accessDetails.isInstructor) {
    const error = new Error("Only the course instructor can mention students")
    error.statusCode = 403
    throw error
  }

  const uniqueMentionUserIds = [
    ...new Set(normalizedMentions.map((mention) => mention.userId)),
  ]

  const validStudentIds = accessDetails.course.studentsEnroled.map((studentId) =>
    studentId.toString()
  )

  const hasInvalidStudent = uniqueMentionUserIds.some(
    (userId) => !validStudentIds.includes(userId)
  )

  if (hasInvalidStudent) {
    const error = new Error("You can only mention students enrolled in this course")
    error.statusCode = 400
    throw error
  }

  const mentionedUsers = await User.find(
    {
      _id: { $in: uniqueMentionUserIds },
    },
    "firstName lastName email image accountType"
  ).lean()

  if (mentionedUsers.length !== uniqueMentionUserIds.length) {
    const error = new Error("One or more mentioned students could not be found")
    error.statusCode = 400
    throw error
  }

  const mentionedUsersMap = new Map(
    mentionedUsers.map((user) => [user._id.toString(), user])
  )

  return normalizedMentions.map((mention) => {
    const mentionedUser = mentionedUsersMap.get(mention.userId)

    if (!message.includes(mention.mentionTag)) {
      const error = new Error(
        `Mention tag ${mention.mentionTag} is missing from the message`
      )
      error.statusCode = 400
      throw error
    }

    return {
      user: mention.userId,
      mentionTag: mention.mentionTag,
      displayName: `${mentionedUser.firstName} ${mentionedUser.lastName}`.trim(),
    }
  })
}

const getPinnedMessageForCourse = async (courseId) => {
  return CourseChatMessage.findOne({
    course: courseId,
    isPinned: true,
  })
    .populate(chatMessagePopulateOptions)
    .lean()
}

exports.getCourseChatMessages = async (req, res) => {
  try {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const accessDetails = await getCourseAccessDetails(courseId, req.user.id)

    if (!accessDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!accessDetails.canAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this course chat",
      })
    }

    const [pinnedMessage, courseMessages, mentionableUsers] = await Promise.all([
      getPinnedMessageForCourse(courseId),
      CourseChatMessage.find({
        course: courseId,
        isPinned: false,
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate(chatMessagePopulateOptions)
        .lean(),
      accessDetails.isInstructor
        ? getMentionableStudents(accessDetails.course.studentsEnroled)
        : Promise.resolve([]),
    ])

    courseMessages.reverse()

    return res.status(200).json({
      success: true,
      data: {
        courseName: accessDetails.course.courseName,
        accessRole: accessDetails.isInstructor ? "Instructor" : "Student",
        canPinMessages: accessDetails.isInstructor,
        pinnedMessage,
        messages: courseMessages,
        mentionableUsers,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Unable to fetch course chat messages",
      error: error.message,
    })
  }
}

exports.createCourseChatMessage = async (req, res) => {
  try {
    const { courseId, message, mentions } = req.body
    const trimmedMessage = message?.trim()

    if (!courseId || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Course ID and message are required",
      })
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message should be 1000 characters or less",
      })
    }

    const accessDetails = await getCourseAccessDetails(courseId, req.user.id)

    if (!accessDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!accessDetails.canAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this course chat",
      })
    }

    const mentionPayload = await buildMentionPayload({
      mentions,
      message: trimmedMessage,
      accessDetails,
    })

    const courseChatMessage = await CourseChatMessage.create({
      course: courseId,
      sender: req.user.id,
      message: trimmedMessage,
      mentions: mentionPayload,
    })

    const populatedMessage = await CourseChatMessage.findById(
      courseChatMessage._id
    )
      .populate(chatMessagePopulateOptions)
      .lean()

    return res.status(200).json({
      success: true,
      data: populatedMessage,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to send course chat message",
      error: error.message,
    })
  }
}

exports.toggleCourseChatPin = async (req, res) => {
  try {
    const { courseId, messageId } = req.body

    if (!courseId || !messageId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and message ID are required",
      })
    }

    const accessDetails = await getCourseAccessDetails(courseId, req.user.id)

    if (!accessDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!accessDetails.isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Only the course instructor can pin messages",
      })
    }

    const messageToPin = await CourseChatMessage.findOne({
      _id: messageId,
      course: courseId,
    })

    if (!messageToPin) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      })
    }

    if (messageToPin.isPinned) {
      messageToPin.isPinned = false
      messageToPin.pinnedBy = null
      await messageToPin.save()

      return res.status(200).json({
        success: true,
        data: null,
        message: "Pinned message removed successfully",
      })
    }

    await CourseChatMessage.updateMany(
      { course: courseId, isPinned: true },
      {
        $set: {
          isPinned: false,
          pinnedBy: null,
          updatedAt: Date.now(),
        },
      }
    )

    messageToPin.isPinned = true
    messageToPin.pinnedBy = req.user.id
    await messageToPin.save()

    const pinnedMessage = await getPinnedMessageForCourse(courseId)

    return res.status(200).json({
      success: true,
      data: pinnedMessage,
      message: "Message pinned successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Unable to update pinned message",
      error: error.message,
    })
  }
}

exports.deleteCourseChatMessage = async (req, res) => {
  try {
    const { courseId, messageId } = req.body

    if (!courseId || !messageId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and message ID are required",
      })
    }

    const accessDetails = await getCourseAccessDetails(courseId, req.user.id)

    if (!accessDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (!accessDetails.canAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this course chat",
      })
    }

    const messageToDelete = await CourseChatMessage.findOne({
      _id: messageId,
      course: courseId,
    })

    if (!messageToDelete) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      })
    }

    const isOwnMessage =
      messageToDelete.sender.toString() === req.user.id.toString()

    if (!isOwnMessage && !accessDetails.isInstructor) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      })
    }

    await CourseChatMessage.findByIdAndDelete(messageId)

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Unable to delete course chat message",
      error: error.message,
    })
  }
}
