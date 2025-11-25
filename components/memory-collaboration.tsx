"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  Mail,
  Edit,
  MessageSquare,
  Clock,
  Check,
  X,
  Crown,
  Eye,
  Camera,
  FileText,
  Heart,
} from "lucide-react"

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: "owner" | "editor" | "viewer"
  joinedAt: string
  lastActive: string
  contributions: number
}

interface CollaborationRequest {
  id: string
  from: string
  email: string
  message: string
  requestedRole: "editor" | "viewer"
  timestamp: string
  status: "pending" | "approved" | "declined"
}

interface MemoryCollaborationProps {
  storyId: string
  storyTitle: string
  isOwner: boolean
  currentUser?: {
    id: string
    name: string
    email: string
  }
}

export default function MemoryCollaboration({ storyId, storyTitle, isOwner, currentUser }: MemoryCollaborationProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "Jake Miller",
      email: "jake@example.com",
      avatar: "/happy-multi-generational-family-outdoors-with-fish.jpg",
      role: "owner",
      joinedAt: "March 2024",
      lastActive: "2 hours ago",
      contributions: 12,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "editor",
      joinedAt: "March 2024",
      lastActive: "1 day ago",
      contributions: 8,
    },
    {
      id: "3",
      name: "Mike Thompson",
      email: "mike@example.com",
      role: "viewer",
      joinedAt: "April 2024",
      lastActive: "3 days ago",
      contributions: 2,
    },
  ])

  const [requests, setRequests] = useState<CollaborationRequest[]>([
    {
      id: "1",
      from: "Emma Wilson",
      email: "emma@example.com",
      message: "Hi! I was at this fishing trip too and have some great photos to add. Would love to contribute!",
      requestedRole: "editor",
      timestamp: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      from: "Tom Davis",
      email: "tom@example.com",
      message: "This looks like an amazing adventure! Can I follow along?",
      requestedRole: "viewer",
      timestamp: "1 day ago",
      status: "pending",
    },
  ])

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer")
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return

    // Simulate sending invite
    console.log("Sending invite to:", inviteEmail, "as", inviteRole)

    // Reset form
    setInviteEmail("")
    setInviteMessage("")
    setShowInviteForm(false)

    // Show success message (in real app, this would be a toast)
    alert(`Invitation sent to ${inviteEmail}!`)
  }

  const handleRequestAction = (requestId: string, action: "approve" | "decline") => {
    setRequests(
      requests.map((request) =>
        request.id === requestId ? { ...request, status: action === "approve" ? "approved" : "declined" } : request,
      ),
    )

    if (action === "approve") {
      const request = requests.find((r) => r.id === requestId)
      if (request) {
        const newCollaborator: Collaborator = {
          id: Date.now().toString(),
          name: request.from,
          email: request.email,
          role: request.requestedRole,
          joinedAt: "Just now",
          lastActive: "Just now",
          contributions: 0,
        }
        setCollaborators([...collaborators, newCollaborator])
      }
    }
  }

  const handleRoleChange = (collaboratorId: string, newRole: "editor" | "viewer") => {
    setCollaborators(
      collaborators.map((collab) => (collab.id === collaboratorId ? { ...collab, role: newRole } : collab)),
    )
  }

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setCollaborators(collaborators.filter((collab) => collab.id !== collaboratorId))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "editor":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "editor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c44c3a]" />
            Memory Collaboration
          </CardTitle>
          <CardDescription className="text-[#6b5b47]">
            Invite family and friends to contribute to "{storyTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-[#6b5b47]">
                <span className="font-medium text-[#2c2c2c]">{collaborators.length}</span> collaborators
              </div>
              <div className="text-sm text-[#6b5b47]">
                <span className="font-medium text-[#2c2c2c]">
                  {collaborators.reduce((sum, c) => sum + c.contributions, 0)}
                </span>{" "}
                total contributions
              </div>
            </div>
            {isOwner && (
              <Button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite People
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Form */}
      {showInviteForm && isOwner && (
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] text-lg">Invite Collaborators</CardTitle>
            <CardDescription className="text-[#6b5b47]">
              Send invitations to family and friends to join this memory story
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="border-[#e5d5c8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                  className="w-full px-3 py-2 border border-[#e5d5c8] rounded-md bg-white"
                >
                  <option value="viewer">Viewer - Can view and comment</option>
                  <option value="editor">Editor - Can add and edit memories</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-2">Personal Message (Optional)</label>
              <Textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal note about why you're inviting them..."
                className="border-[#e5d5c8] h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendInvite}
                disabled={!inviteEmail.trim()}
                className="bg-[#c44c3a] hover:bg-[#a63d2e] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
              <Button
                onClick={() => setShowInviteForm(false)}
                variant="outline"
                className="border-[#e5d5c8] bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaboration Requests */}
      {isOwner && requests.filter((r) => r.status === "pending").length > 0 && (
        <Card className="border-[#e5d5c8]">
          <CardHeader>
            <CardTitle className="text-[#2c2c2c] text-lg">Collaboration Requests</CardTitle>
            <CardDescription className="text-[#6b5b47]">People who want to contribute to your story</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests
              .filter((r) => r.status === "pending")
              .map((request) => (
                <div key={request.id} className="bg-[#f5f0e8] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#c44c3a] text-white">{request.from.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-[#2c2c2c]">{request.from}</h4>
                        <p className="text-sm text-[#6b5b47]">{request.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(request.requestedRole)}>
                            {getRoleIcon(request.requestedRole)}
                            <span className="ml-1 capitalize">{request.requestedRole}</span>
                          </Badge>
                          <span className="text-xs text-[#6b5b47]">{request.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#2c2c2c] mb-4 leading-relaxed">{request.message}</p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestAction(request.id, "approve")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRequestAction(request.id, "decline")}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Current Collaborators */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] text-lg">Current Collaborators</CardTitle>
          <CardDescription className="text-[#6b5b47]">People who have access to this memory story</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-4 bg-[#f5f0e8] rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={collaborator.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-[#c44c3a] text-white">{collaborator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-[#2c2c2c]">{collaborator.name}</h4>
                    <p className="text-sm text-[#6b5b47]">{collaborator.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge className={getRoleBadgeColor(collaborator.role)}>
                        {getRoleIcon(collaborator.role)}
                        <span className="ml-1 capitalize">{collaborator.role}</span>
                      </Badge>
                      <span className="text-xs text-[#6b5b47]">{collaborator.contributions} contributions</span>
                      <span className="text-xs text-[#6b5b47]">Active {collaborator.lastActive}</span>
                    </div>
                  </div>
                </div>

                {isOwner && collaborator.role !== "owner" && (
                  <div className="flex items-center gap-2">
                    <select
                      value={collaborator.role}
                      onChange={(e) => handleRoleChange(collaborator.id, e.target.value as "editor" | "viewer")}
                      className="px-2 py-1 text-xs border border-[#e5d5c8] rounded bg-white"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <Button
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Activity */}
      <Card className="border-[#e5d5c8]">
        <CardHeader>
          <CardTitle className="text-[#2c2c2c] text-lg">Recent Activity</CardTitle>
          <CardDescription className="text-[#6b5b47]">Latest contributions and changes to this story</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                user: "Sarah Johnson",
                action: "added 3 new photos",
                time: "2 hours ago",
                icon: <Camera className="w-4 h-4 text-blue-500" />,
              },
              {
                user: "Jake Miller",
                action: "updated the story description",
                time: "1 day ago",
                icon: <FileText className="w-4 h-4 text-green-500" />,
              },
              {
                user: "Mike Thompson",
                action: "liked the fishing story",
                time: "2 days ago",
                icon: <Heart className="w-4 h-4 text-red-500" />,
              },
              {
                user: "Sarah Johnson",
                action: "commented on the sunset photo",
                time: "3 days ago",
                icon: <MessageSquare className="w-4 h-4 text-purple-500" />,
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-[#2c2c2c]">
                    <strong>{activity.user}</strong> {activity.action}
                  </p>
                  <p className="text-xs text-[#6b5b47] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
