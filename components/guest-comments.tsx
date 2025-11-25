"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Reply, Flag, ThumbsUp } from "lucide-react"

interface Comment {
  id: string
  author: string
  email?: string
  content: string
  timestamp: string
  likes: number
  replies: Comment[]
  isOwner?: boolean
  isGuest: boolean
}

interface GuestCommentsProps {
  storyId: string
  storyTitle: string
  ownerName: string
  commentsEnabled: boolean
}

export default function GuestComments({ storyId, storyTitle, ownerName, commentsEnabled }: GuestCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Sarah M.",
      content: "What a beautiful story! These memories are so precious. Thank you for sharing this with us.",
      timestamp: "2 hours ago",
      likes: 5,
      replies: [
        {
          id: "1-1",
          author: ownerName,
          content: "Thank you so much, Sarah! It means a lot to share these moments.",
          timestamp: "1 hour ago",
          likes: 2,
          replies: [],
          isOwner: true,
          isGuest: false,
        },
      ],
      isGuest: true,
    },
    {
      id: "2",
      author: "Mike Johnson",
      content: "This reminds me of my own fishing trips with my grandfather. Such wonderful memories!",
      timestamp: "5 hours ago",
      likes: 8,
      replies: [],
      isGuest: true,
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmitComment = () => {
    if (!newComment.trim() || !guestName.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: guestName,
      email: guestEmail,
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      replies: [],
      isGuest: true,
    }

    setComments([comment, ...comments])
    setNewComment("")
    setGuestName("")
    setGuestEmail("")
    setShowCommentForm(false)
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !guestName.trim()) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: guestName,
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
      replies: [],
      isGuest: true,
    }

    setComments(
      comments.map((comment) =>
        comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )

    setReplyContent("")
    setReplyingTo(null)
  }

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(
        comments.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply,
                ),
              }
            : comment,
        ),
      )
    } else {
      setComments(
        comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
      )
    }
  }

  if (!commentsEnabled) {
    return (
      <Card className="border-[#e5d5c8] mt-8">
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 text-[#6b5b47] mx-auto mb-3" />
          <p className="text-[#6b5b47]">Comments are disabled for this story.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Comments Header */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Guest Comments ({comments.length})
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">Share your thoughts about {storyTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {!showCommentForm ? (
            <Button
              onClick={() => setShowCommentForm(true)}
              className="w-full bg-[#c44c3a] hover:bg-[#a63d2e] text-white min-h-[48px] touch-manipulation"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Leave a Comment
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Your Name *</label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="border-[#e5d5c8] min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Email (Optional)</label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-[#e5d5c8] min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Your Comment *</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this story..."
                  className="border-[#e5d5c8] min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || !guestName.trim()}
                  className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white min-h-[48px] touch-manipulation"
                >
                  Post Comment
                </Button>
                <Button
                  onClick={() => {
                    setShowCommentForm(false)
                    setNewComment("")
                    setGuestName("")
                    setGuestEmail("")
                  }}
                  variant="outline"
                  className="border-[#e5d5c8] bg-transparent min-h-[48px] touch-manipulation"
                >
                  Cancel
                </Button>
              </div>

              <div className="bg-[#f5f0e8] rounded-lg p-3">
                <p className="text-xs text-[#6b5b47]">
                  <strong>Guidelines:</strong> Please be respectful and kind. Comments are moderated and inappropriate
                  content will be removed.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="border-[#e5d5c8]">
            <CardContent className="p-4">
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-[44px] min-h-[44px] bg-[#c44c3a] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.author.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#2c2c2c]">{comment.author}</span>
                      {comment.isOwner && <Badge className="bg-[#c44c3a] text-white text-xs">Story Owner</Badge>}
                      {comment.isGuest && (
                        <Badge variant="outline" className="border-[#e5d5c8] text-[#6b5b47] text-xs">
                          Guest
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-[#6b5b47]">{comment.timestamp}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#6b5b47] hover:text-[#c44c3a] min-w-[44px] min-h-[44px] touch-manipulation"
                >
                  <Flag className="w-3 h-3" />
                </Button>
              </div>

              {/* Comment Content */}
              <p className="text-[#2c2c2c] mb-3 leading-relaxed">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-6 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className="text-[#6b5b47] hover:text-[#c44c3a] p-2 h-auto min-h-[44px] touch-manipulation"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {comment.likes > 0 && comment.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-[#6b5b47] hover:text-[#c44c3a] p-2 h-auto min-h-[44px] touch-manipulation"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-4 border-l-2 border-[#e5d5c8] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your name"
                      className="border-[#e5d5c8] min-h-[48px]"
                    />
                  </div>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="border-[#e5d5c8] min-h-[100px]"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim() || !guestName.trim()}
                      size="sm"
                      className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white min-h-[44px] touch-manipulation"
                    >
                      Post Reply
                    </Button>
                    <Button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent("")
                      }}
                      variant="outline"
                      size="sm"
                      className="border-[#e5d5c8] bg-transparent min-h-[44px] touch-manipulation"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-[#e5d5c8] space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-[#f5f0e8] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="min-w-[36px] min-h-[36px] bg-[#8b7355] rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {reply.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#2c2c2c] text-sm">{reply.author}</span>
                              {reply.isOwner && <Badge className="bg-[#c44c3a] text-white text-xs">Owner</Badge>}
                            </div>
                            <span className="text-xs text-[#6b5b47]">{reply.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#2c2c2c] text-sm mb-2">{reply.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(reply.id, true, comment.id)}
                        className="text-[#6b5b47] hover:text-[#c44c3a] p-2 h-auto min-h-[40px] text-xs touch-manipulation"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {reply.likes > 0 && reply.likes}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Comments */}
      {comments.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="border-[#e5d5c8] bg-transparent min-h-[48px] px-8 touch-manipulation">
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  )
}
