"use client"
import { useState } from "react"
import Sidebar from "../pages/Sidebar"
import Dashboard from "../pages/Dashboard"
import UserData from "../pages/UserData"
import UserDetail from "../pages/UserDetail"
import UserInfo from "../pages/UserInfo"
import ReelsManagement from "../pages/ManageReels"
import ManagePosts from "../pages/ManagePosts"


export default function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard")
  const [showReelsVideos, setShowReelsVideos] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true) // Default collapsed
  const [selectedUser, setSelectedUser] = useState(null)
  const [previousPage, setPreviousPage] = useState("User Data")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <Dashboard />
      case "User Data":
        return (
          <UserData
            onViewClick={(user) => {
              setSelectedUser(user)
              setPreviousPage("User Data")
              setCurrentPage("UserDetail")
              setShowReelsVideos(true)
            }}
          />
        )
      case "UserDetail":
        return (
          <UserDetail
            selectedUser={selectedUser}
            onViewUser={() => {
              setCurrentPage("UserInfo")
            }}
            onBackToUsers={() => {
              setCurrentPage("User Data")
            }}
          />
        )
      case "UserInfo":
        return <UserInfo selectedUser={selectedUser} onBackToUsers={() => {
          setCurrentPage(previousPage)
        }} />
      case "Manage Reels":
        return <ReelsManagement />
      case "Manage Videos/Posts":
        return (
          <ManagePosts
            onViewClick={(user) => {
              setSelectedUser(user)
              setPreviousPage("Manage Videos/Posts")
              setCurrentPage("UserInfo")
            }}
          />
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        showReelsVideos={showReelsVideos}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      {/* Main content area with responsive margins */}
      <div className="flex-1 min-w-0 ml-0 lg:ml-16">
        {/* Mobile header with hamburger menu */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#B65FCF]"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{currentPage}</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        
        {renderCurrentPage()}
      </div>
    </div>
  )
}
