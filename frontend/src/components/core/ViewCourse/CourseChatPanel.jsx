import { useEffect, useState } from "react"
import { BsPinAngle } from "react-icons/bs"
import { RxCross2 } from "react-icons/rx"
import { FiSend, FiTrash2 } from "react-icons/fi"
import { useSelector } from "react-redux"

import { formatDate } from "../../../services/formatDate"
import {
  deleteCourseChatMessage,
  getCourseChat,
  sendCourseChatMessage,
  toggleCourseChatPin,
} from "../../../services/operations/courseDetailsAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"

const getUserAvatar = (user) => {
  if (user?.image) {
    return user.image
  }

  return `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || ""} ${user?.lastName || ""}`
}

const roleBadgeStyles = {
  Instructor: "bg-yellow-100/20 text-yellow-25",
  Student: "bg-caribbeangreen-300/10 text-caribbeangreen-100",
}

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const buildMentionTag = (userDetails) => {
  const normalizedName = `${userDetails?.firstName || ""}_${userDetails?.lastName || ""}`
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")

  return `@${normalizedName || "student"}`
}

const renderMessageWithMentions = (chatMessage) => {
  const messageText = chatMessage?.message || ""
  const mentions = Array.isArray(chatMessage?.mentions) ? chatMessage.mentions : []

  if (!mentions.length) {
    return messageText
  }

  const matches = mentions
    .map((mention) => ({
      ...mention,
      startIndex: messageText.indexOf(mention.mentionTag),
    }))
    .filter((mention) => mention.startIndex >= 0)
    .sort((firstMention, secondMention) => firstMention.startIndex - secondMention.startIndex)

  if (!matches.length) {
    return messageText
  }

  const renderedParts = []
  let currentIndex = 0

  matches.forEach((mention, index) => {
    if (mention.startIndex > currentIndex) {
      renderedParts.push(messageText.slice(currentIndex, mention.startIndex))
    }

    renderedParts.push(
      <span
        key={`${mention.mentionTag}-${index}`}
        className="rounded-md bg-yellow-100/20 px-1.5 py-0.5 font-semibold text-yellow-25"
      >
        {mention.mentionTag.replace(/_/g, " ")}
      </span>
    )

    currentIndex = mention.startIndex + mention.mentionTag.length
  })

  if (currentIndex < messageText.length) {
    renderedParts.push(messageText.slice(currentIndex))
  }

  return renderedParts
}

function ChatMessageCard({
  chatMessage,
  currentUserId,
  canPinMessages,
  isPinnedCard = false,
  actionMessageId,
  onDelete,
  onTogglePin,
}) {
  const isOwnMessage = chatMessage?.sender?._id === currentUserId
  const canDeleteMessage = canPinMessages || isOwnMessage
  const isBusy = actionMessageId === chatMessage?._id
  const roleClassName =
    roleBadgeStyles[chatMessage?.sender?.accountType] ||
    "bg-richblack-700 text-richblack-100"

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPinnedCard
          ? "border-yellow-100/60 bg-yellow-100/10"
          : "border-richblack-700 bg-richblack-800/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <img
            src={getUserAvatar(chatMessage?.sender)}
            alt={`${chatMessage?.sender?.firstName || "User"} avatar`}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-richblack-5">
                {chatMessage?.sender?.firstName} {chatMessage?.sender?.lastName}
              </p>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${roleClassName}`}
              >
                {chatMessage?.sender?.accountType}
              </span>
              {isPinnedCard && (
                <span className="rounded-full bg-yellow-50 px-2 py-1 text-[11px] font-semibold text-richblack-900">
                  Pinned by instructor
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-richblack-300">
              {formatDate(chatMessage?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canPinMessages && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onTogglePin(chatMessage?._id)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                isPinnedCard
                  ? "border-yellow-100/60 text-yellow-25 hover:bg-yellow-100/10"
                  : "border-richblack-600 text-richblack-50 hover:bg-richblack-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <BsPinAngle />
                {isPinnedCard ? "Unpin" : "Pin"}
              </span>
            </button>
          )}
          {canDeleteMessage && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onDelete(chatMessage?._id)}
              className="rounded-lg border border-pink-200/40 px-3 py-2 text-xs font-semibold text-pink-100 transition-all duration-200 hover:bg-pink-200/10"
            >
              <span className="flex items-center gap-2">
                <FiTrash2 />
                Delete
              </span>
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-richblack-25">
        {renderMessageWithMentions(chatMessage)}
      </p>
    </div>
  )
}

export default function CourseChatPanel({ courseId }) {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [courseChatData, setCourseChatData] = useState({
    courseName: "",
    pinnedMessage: null,
    messages: [],
    canPinMessages: false,
  })
  const [chatLoading, setChatLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [actionMessageId, setActionMessageId] = useState("")
  const [message, setMessage] = useState("")
  const [selectedMentions, setSelectedMentions] = useState([])
  const isInstructor = user?.accountType === ACCOUNT_TYPE.INSTRUCTOR

  const mentionMatch = message.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/)
  const mentionQuery = mentionMatch?.[1]?.toLowerCase() || ""

  const fetchCourseChatMessages = async ({
    showLoader = false,
    showErrorToast = true,
  } = {}) => {
    if (!courseId || !token) {
      return
    }

    if (showLoader) {
      setChatLoading(true)
    }

    const result = await getCourseChat(courseId, token, {
      showLoader: false,
      showErrorToast,
    })

    if (result) {
      setCourseChatData(result)
    }

    if (showLoader) {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadChat = async (showLoader) => {
      if (!isMounted) {
        return
      }
      await fetchCourseChatMessages({
        showLoader,
        showErrorToast: showLoader,
      })
    }

    loadChat(true)

    const intervalId = setInterval(() => {
      loadChat(false)
    }, 15000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token])

  useEffect(() => {
    setSelectedMentions((previousMentions) =>
      previousMentions.filter((mention) => message.includes(mention.mentionTag))
    )
  }, [message])

  const mentionableUsers = Array.isArray(courseChatData?.mentionableUsers)
    ? courseChatData.mentionableUsers
    : []

  const filteredMentionableUsers =
    isInstructor && mentionMatch
      ? mentionableUsers.filter((mentionableUser) => {
          const fullName =
            `${mentionableUser.firstName} ${mentionableUser.lastName}`.toLowerCase()
          const tag = buildMentionTag(mentionableUser).toLowerCase()

          return (
            fullName.includes(mentionQuery) ||
            mentionableUser.email?.toLowerCase().includes(mentionQuery) ||
            tag.includes(`@${mentionQuery}`)
          )
        })
      : []

  const replaceActiveMentionQuery = (mentionTag) => {
    const updatedMessage = message.replace(
      /(?:^|\s)@([a-zA-Z0-9_]*)$/,
      (matchedValue) => {
        const prefix = matchedValue.startsWith(" ") ? " " : ""
        return `${prefix}${mentionTag} `
      }
    )

    setMessage(updatedMessage)
  }

  const handleMentionSelect = (mentionableUser) => {
    const mentionTag = buildMentionTag(mentionableUser)

    replaceActiveMentionQuery(mentionTag)

    setSelectedMentions((previousMentions) => {
      const otherMentions = previousMentions.filter(
        (mention) => mention.userId !== mentionableUser._id
      )

      return [
        ...otherMentions,
        {
          userId: mentionableUser._id,
          mentionTag,
          displayName: `${mentionableUser.firstName} ${mentionableUser.lastName}`.trim(),
        },
      ]
    })
  }

  const handleMentionRemove = (mentionTag) => {
    const mentionPattern = new RegExp(`(^|\\s)${escapeRegExp(mentionTag)}(?=\\s|$)`, "g")
    setMessage((previousMessage) =>
      previousMessage.replace(mentionPattern, " ").replace(/\s{2,}/g, " ").trim()
    )
    setSelectedMentions((previousMentions) =>
      previousMentions.filter((mention) => mention.mentionTag !== mentionTag)
    )
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!message.trim() || sendingMessage) {
      return
    }

    setSendingMessage(true)
    const sentMessage = await sendCourseChatMessage(
      courseId,
      message,
      selectedMentions,
      token
    )

    if (sentMessage) {
      setCourseChatData((prevData) => ({
        ...prevData,
        messages: [...prevData.messages, sentMessage],
      }))
      setMessage("")
      setSelectedMentions([])
    }

    setSendingMessage(false)
  }

  const handleTogglePin = async (messageId) => {
    setActionMessageId(messageId)
    await toggleCourseChatPin(courseId, messageId, token)
    await fetchCourseChatMessages({ showErrorToast: true })
    setActionMessageId("")
  }

  const handleDeleteMessage = async (messageId) => {
    setActionMessageId(messageId)
    const didDelete = await deleteCourseChatMessage(courseId, messageId, token)

    if (didDelete) {
      setCourseChatData((prevData) => ({
        ...prevData,
        pinnedMessage:
          prevData.pinnedMessage?._id === messageId
            ? null
            : prevData.pinnedMessage,
        messages: prevData.messages.filter(
          (courseMessage) => courseMessage._id !== messageId
        ),
      }))
    }

    setActionMessageId("")
  }

  return (
    <aside className="flex h-full w-full max-w-[420px] flex-col border-t border-richblack-700 bg-richblack-800 xl:w-[380px] xl:border-l xl:border-t-0">
      <div className="border-b border-richblack-700 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-richblack-5">
              Course Chat
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              fetchCourseChatMessages({
                showLoader: true,
                showErrorToast: true,
              })
            }
            className="rounded-lg border border-richblack-600 px-3 py-2 text-xs font-semibold text-richblack-5 transition-all duration-200 hover:bg-richblack-700"
          >
            Refresh
          </button>
        </div>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-richblack-200">
          {/* <span className="rounded-full bg-richblack-700 px-3 py-1">
            Auto-delete after 48 hours
          </span> */}
          {isInstructor && (
            <span className="rounded-full bg-yellow-100/20 px-3 py-1 text-yellow-25">
              You can pin one message at a time
            </span>
          )}
          {isInstructor && (
            <span className="rounded-full bg-richblack-700 px-3 py-1">
              Type `@` to mention a student
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {chatLoading ? (
          <div className="rounded-xl border border-richblack-700 bg-richblack-900/60 p-4 text-sm text-richblack-200">
            Loading chat...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courseChatData?.pinnedMessage ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-25">
                  Pinned message
                </p>
                <ChatMessageCard
                  chatMessage={courseChatData.pinnedMessage}
                  currentUserId={user?._id}
                  canPinMessages={courseChatData.canPinMessages}
                  isPinnedCard={true}
                  actionMessageId={actionMessageId}
                  onDelete={handleDeleteMessage}
                  onTogglePin={handleTogglePin}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-richblack-600 bg-richblack-900/50 p-4 text-sm text-richblack-300">
                Abhi koi pinned message nahi hai.
              </div>
            )}

            {courseChatData?.messages?.length > 0 ? (
              courseChatData.messages.map((courseMessage) => (
                <ChatMessageCard
                  key={courseMessage._id}
                  chatMessage={courseMessage}
                  currentUserId={user?._id}
                  canPinMessages={courseChatData.canPinMessages}
                  actionMessageId={actionMessageId}
                  onDelete={handleDeleteMessage}
                  onTogglePin={handleTogglePin}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-richblack-600 bg-richblack-900/50 p-4 text-sm text-richblack-300">
                Chat abhi empty hai. Pehla message bhej kar discussion start
                karo.
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-richblack-700 px-5 py-4"
      >
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-richblack-300">
          {courseChatData?.courseName || "Course"} discussion
        </label>
        {selectedMentions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedMentions.map((mention) => (
              <button
                key={mention.userId}
                type="button"
                onClick={() => handleMentionRemove(mention.mentionTag)}
                className="flex items-center gap-2 rounded-full bg-yellow-100/15 px-3 py-1 text-xs font-medium text-yellow-25"
              >
                {mention.displayName}
                <RxCross2 />
              </button>
            ))}
          </div>
        )}
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Type a useful update, doubt, or announcement..."
          className="w-full resize-none rounded-xl border border-richblack-600 bg-richblack-900 p-3 text-sm text-richblack-5 outline-none transition-all duration-200 placeholder:text-richblack-400 focus:border-yellow-50"
        />
        {filteredMentionableUsers.length > 0 && (
          <div className="mt-1 rounded-xl border border-richblack-700 bg-richblack-900/90 p-2">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-richblack-300">
              Mention a student
            </p>
            <div className="mt-1 flex max-h-44 flex-col overflow-y-auto">
              {filteredMentionableUsers.map((mentionableUser) => (
                <button
                  key={mentionableUser._id}
                  type="button"
                  onClick={() => handleMentionSelect(mentionableUser)}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-all duration-200 hover:bg-richblack-800"
                >
                  <img
                    src={getUserAvatar(mentionableUser)}
                    alt={`${mentionableUser.firstName} avatar`}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-richblack-5">
                      {mentionableUser.firstName} {mentionableUser.lastName}
                    </p>
                    <p className="text-xs text-richblack-300">
                      {mentionableUser.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs text-richblack-300">
            {message.trim().length}/1000 characters
          </p>
          <button
            type="submit"
            disabled={sendingMessage || !message.trim()}
            className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 transition-all duration-200 hover:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              <FiSend />
              {sendingMessage ? "Sending..." : "Send"}
            </span>
          </button>
        </div>
      </form>
    </aside>
  )
}
