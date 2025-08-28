"use client"

import { useState } from "react"
import { Eye, MessageCircle, User } from "lucide-react"

const StoryRecord = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("All Stories")

  // Sample data for stories
  const stories = [
    {
      id: 1,
      type: "audio",
      thumbnail: "/landscape-story.png",
      uploadDate: "15 Aug 2025",
      views: 1250,
      replies: 45,
      status: "Active",
    },
    {
      id: 2,
      type: "reel",
      thumbnail: "/majestic-castle-reel.png",
      uploadDate: "15 Aug 2025",
      views: 230,
      replies: 12,
      status: "Active",
    },
    {
      id: 3,
      type: "post",
      thumbnail: "/mountain-post.png",
      uploadDate: "15 Aug 2025",
      views: 310,
      replies: 8,
      status: "Active",
    },
    {
      id: 4,
      type: "comment",
      thumbnail: "/sunset-comment.png",
      uploadDate: "14 Aug 2025",
      views: 250,
      replies: 15,
      status: "Expired",
    },
  ]

  const tabs = ["All Stories"]

  const getTypeIcon = (type) => {
    switch (type) {
      case "audio":
        return "🎤"
      case "reel":
        return "🎬"
      case "post":
        return "📝"
      case "comment":
        return "💬"
      default:
        return "📄"
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "audio":
        return "Audio"
      case "reel":
        return "Reel"
      case "post":
        return "Post"
      case "comment":
        return "Comment"
      default:
        return "Story"
    }
  }

  // Calculate percentages for pie chart
  const totalViews = 8940
  const reelViews = 2500
  const postViews = 3200
  const audioViews = 2140
  const commentViews = 1100

  const reelPercentage = (reelViews / totalViews) * 100
  const postPercentage = (postViews / totalViews) * 100
  const audioPercentage = (audioViews / totalViews) * 100
  const commentPercentage = (commentViews / totalViews) * 100

  // Create SVG path for donut chart
  const createPath = (startAngle, endAngle, innerRadius = 40, outerRadius = 64) => {
    const start = polarToCartesian(64, 64, outerRadius, endAngle)
    const end = polarToCartesian(64, 64, outerRadius, startAngle)
    const innerStart = polarToCartesian(64, 64, innerRadius, endAngle)
    const innerEnd = polarToCartesian(64, 64, innerRadius, startAngle)

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

    return [
      "M",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ")
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const activeStories = stories.filter((story) => story.status === "Active")
  const expiredStories = stories.filter((story) => story.status === "Expired")
  const totalStories = stories.length

  const activePercentage = (activeStories.length / totalStories) * 100
  const expiredPercentage = (expiredStories.length / totalStories) * 100

  const recentStories = [
    { date: "Aug 9", replies: 12 },
    { date: "Aug 10", replies: 8 },
    { date: "Aug 11", replies: 15 },
    { date: "Aug 12", replies: 6 },
    { date: "Aug 13", replies: 18 },
    { date: "Aug 14", replies: 10 },
    { date: "Aug 15", replies: 22 },
  ]

  const weeklyViews = [
    { day: "Mon", views: 1200 },
    { day: "Tue", views: 1450 },
    { day: "Wed", views: 1100 },
    { day: "Thu", views: 1650 },
    { day: "Fri", views: 1800 },
    { day: "Sat", views: 1350 },
    { day: "Sun", views: 1600 },
  ]

  const filteredStories = () => {
    switch (activeTab) {
      case "Active Stories":
        return activeStories
      case "Expired Stories":
        return expiredStories
      default:
        return stories
    }
  }

  const maxViews = Math.max(...weeklyViews.map(item => item.views))

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header with Profile */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Profile */}
            <div className="flex-1">
              {/* Profile removed */}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">156</div>
                  <div className="text-sm text-gray-600 font-medium">Total Stories</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 font-inter tracking-tight">326</div>
                  <div className="text-sm text-gray-600 font-medium">Total Replies</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-8 border-b border-gray-200 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                      activeTab === tab
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Recent Comments/Engagement Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Engagement</h3>
                
                {/* Comment Options */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                    All Reels
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Posts
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Comments
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    Audio Stories
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎬
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Mountain Adventure Reel</span></p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+5 replies</div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      📝
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Sunset Photography Post</span></p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+3 replies</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                      🎤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New comment on <span className="font-medium">Travel Story Audio</span></p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                    <div className="text-sm text-gray-500">+8 replies</div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All Comments
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Analytics */}
            <div className="lg:w-80 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>

              {/* Analytics Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Stories</span>
                  <span className="font-bold text-gray-900 font-inter">156</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Replies</span>
                  <span className="font-bold text-gray-900 font-inter">425</span>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Story Status Distribution</h4>
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <svg width="128" height="128" className="transform -rotate-90">
                    <path
                      d={createPath(0, activePercentage * 3.6)}
                      fill="#10B981"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <path
                      d={createPath(activePercentage * 3.6, 360)}
                      fill="#6B7280"
                      className="hover:opacity-80 transition-opacity"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 font-inter tracking-tight">156</div>
                      <div className="text-xs text-gray-500 font-medium">Total Stories</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Active</span>
                    </div>
                    <span className="font-medium">{activePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-600">Expired</span>
                    </div>
                    <span className="font-medium">{expiredPercentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Story Engagement</h4>
                <div className="flex items-end justify-between h-20 gap-1">
                  {recentStories.map((story, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-purple-500 rounded-t"
                        style={{
                          height: `${(story.replies / 22) * 60}px`,
                          minHeight: "4px"
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{story.date.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Views Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Views</h4>
                <div className="flex items-end justify-between h-16 gap-1">
                  {weeklyViews.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-blue-500 rounded-t"
                        style={{
                          height: `${(item.views / maxViews) * 48}px`,
                          minHeight: "4px"
                        }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Stories List */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid gap-4">
              {filteredStories().map((story) => (
                <div
                  key={story.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  {/* Story Thumbnail */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={story.thumbnail || "/placeholder.svg"}
                        alt={getTypeLabel(story.type)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
                      {getTypeIcon(story.type)}
                    </div>
                  </div>

                  {/* Story Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{getTypeLabel(story.type)} Story</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          story.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {story.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Uploaded on {story.uploadDate}</p>
                  </div>

                  {/* Story Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{story.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{story.replies}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {filteredStories().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">📚</div>
                <p className="text-gray-500">No stories found for the selected filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryRecord
