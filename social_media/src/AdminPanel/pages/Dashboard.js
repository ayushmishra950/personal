"use client"

import { Search, Bell, User, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import CountUp from "react-countup"
import {GET_TOTAL_USERS, GET_TOTAL_POSTS, GET_BLOCKED_COUNT}  from "../../graphql/mutations"
import { gql, useQuery } from '@apollo/client';
import socket from "../../components/socket_io/Socket";
import { GetTokenFromCookie } from '../../components/getToken/GetToken';



export default function Dashboard() {
  const [isAnimated, setIsAnimated] = useState(false);
    const [allUsers, setAllUsers] = useState(0);
    const [allBlockUsers, setAllBlockUsers] = useState(0);
    const [allPosts, setPosts] = useState(0);
    const [allActiveUsers, setAllActiveUsers] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [sender, setSender] = useState();



const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_TOTAL_USERS);
const { data: postsData, loading: postsLoading, error: postsError } = useQuery(GET_TOTAL_POSTS);
const { data: blockData, loading: blockLoading, error: blockError } = useQuery(GET_BLOCKED_COUNT);
    
    // Socket authentication and join room
    useEffect(() => {
        try {
            const decodedUser = GetTokenFromCookie();
            if (decodedUser?.id) {
                const userId = decodedUser.id.toString();
                console.log("Dashboard: User authenticated with ID:", userId);
                
                setSender({ ...decodedUser, id: userId });
                
                // Join socket room
                if (socket.connected) {
                    console.log("Dashboard: Socket connected, joining room:", userId);
                    socket.emit("join", userId);
                } else {
                    console.log("Dashboard: Socket not connected yet, will join on connect");
                }
                
                // Setup reconnection handler
                const handleReconnect = () => {
                    console.log("Dashboard: Socket reconnected, rejoining room with ID:", userId);
                    socket.emit("join", userId);
                    
                    setTimeout(() => {
                        socket.emit("getOnlineUsers");
                    }, 500);
                };
                
                socket.on("connect", handleReconnect);
                
                return () => {
                    socket.off("connect", handleReconnect);
                };
            } else {
                console.warn("Dashboard: No user ID found in token");
            }
        } catch (error) {
            console.error("Dashboard: Error decoding token or joining socket:", error);
        }
    }, []);

    // Socket events for online users
    useEffect(() => {
        const handleOnlineUsersUpdate = (users) => {
            try {
                const stringifiedUsers = users.map(id => id.toString());
                console.log("Dashboard: Online users received from server:", stringifiedUsers);
                
                const onlineSet = new Set(stringifiedUsers);
                
                setOnlineUsers(prevOnlineUsers => {
                    const newOnlineUsers = new Set(prevOnlineUsers);
                    
                    for (const userId of stringifiedUsers) {
                        if (!prevOnlineUsers.has(userId)) {
                            console.log(`Dashboard: User ${userId} is now online`);
                            newOnlineUsers.add(userId);
                        }
                    }
                    
                    for (const userId of prevOnlineUsers) {
                        if (!stringifiedUsers.includes(userId)) {
                            console.log(`Dashboard: User ${userId} is now offline`);
                            newOnlineUsers.delete(userId);
                        }
                    }
                    
                    return newOnlineUsers;
                });
                
                // Update active users count with real online users count
                setAllActiveUsers(stringifiedUsers.length);
                
                console.log("Dashboard: Online users count updated:", stringifiedUsers.length);
            } catch (error) {
                console.error("Dashboard: Error handling online users update:", error);
            }
        };

        const handleReconnect = () => {
            try {
                console.log("Dashboard: Socket reconnected, refreshing online users");
                if (sender?.id) {
                    const userId = sender.id.toString();
                    console.log("Dashboard: Rejoining room with ID:", userId);
                    socket.emit("join", userId);
                    
                    setTimeout(() => {
                        socket.emit("getOnlineUsers");
                    }, 500);
                }
            } catch (error) {
                console.error("Dashboard: Error handling socket reconnection:", error);
            }
        };

        socket.on("updateOnlineUsers", handleOnlineUsersUpdate);
        socket.on("connect", handleReconnect);

        // Request current online users on mount
        if (socket.connected) {
            console.log("Dashboard: Socket already connected, requesting online users");
            socket.emit("getOnlineUsers");
        }

        // Set up polling for online users every 5 seconds
        const onlineUsersPollingInterval = setInterval(() => {
            if (socket.connected) {
                console.log("Dashboard: Polling for online users");
                socket.emit("getOnlineUsers");
            }
        }, 5000);

        return () => {
            socket.off("updateOnlineUsers", handleOnlineUsersUpdate);
            socket.off("connect", handleReconnect);
            clearInterval(onlineUsersPollingInterval);
        };
    }, [sender?.id]);

    useEffect(()=>{
        if(usersData){
            setAllUsers(usersData?.allUsers)
        }
        if(postsData){
            setPosts(postsData?.totalPosts)
        }
        if(blockData){
            setAllBlockUsers(blockData?.BlockCount)
        }
    },[usersData,postsData,blockData])


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true)
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])


  const stats = [
    { title: "Total Users", value:1000, startValue: 4200, displayValue: "4,562", change: null },
    { title: "Active Users", value: 1450, startValue: 1350, displayValue: "1,450", change: "12% Today" },
    { title: "Blocked Users", value: 23, startValue: 21, displayValue: "23", change: null },
    { title: "Total Posts", value: 8560, startValue: 7900, displayValue: "8,560", change: null },
  ]

  const renderStatsCards = () => {
    return (
      <>
        {/* Total Users */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 truncate">Total Users</h3>
          <div className="flex items-end justify-between min-w-0">
            <span className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
              <CountUp
                start={4200}
                end={allUsers || 0}
                duration={2}
                separator=","
                useEasing={true}
                easingFn={(t, b, c, d) => {
                  return c * ((t = t / d - 1) * t * t + 1) + b
                }}
              />
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 truncate">Active Users</h3>
          <div className="flex items-end justify-between min-w-0">
            <span className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
              <CountUp
                start={0}
                end={allActiveUsers || 0}
                duration={1}
                separator=","
                useEasing={true}
                easingFn={(t, b, c, d) => {
                  return c * ((t = t / d - 1) * t * t + 1) + b
                }}
              />
            </span>
          </div>
          <div className="flex items-center mt-1 sm:mt-2 min-w-0">
            <div className={`w-2 h-2 rounded-full mr-1 flex-shrink-0 ${allActiveUsers > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-xs sm:text-sm truncate ${allActiveUsers > 0 ? 'text-green-500' : 'text-gray-400'}`}>
              {allActiveUsers > 0 ? 'Real-time Online' : 'No users online'}
            </span>
          </div>
        </div>

        {/* Blocked Users */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 truncate">Blocked Users</h3>
          <div className="flex items-end justify-between min-w-0">
            <span className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
              <CountUp
                start={21}
                end={allBlockUsers || 0}
                duration={2}
                separator=","
                useEasing={true}
                easingFn={(t, b, c, d) => {
                  return c * ((t = t / d - 1) * t * t + 1) + b
                }}
              />
            </span>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2 truncate">Total Posts</h3>
          <div className="flex items-end justify-between min-w-0">
            <span className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
              <CountUp
                start={7900}
                end={allPosts || 8560}
                duration={2}
                separator=","
                useEasing={true}
                easingFn={(t, b, c, d) => {
                  return c * ((t = t / d - 1) * t * t + 1) + b
                }}
              />
            </span>
          </div>
        </div>
      </>
    )
  }

  const renderChart = (title, data, color) => {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 min-w-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">{title}</h3>
        <div className="h-48 sm:h-64 flex items-end justify-center space-x-2 sm:space-x-6 px-2 sm:px-4 overflow-hidden">
          {data.map((bar, index) => (
            <div key={index} className="flex flex-col items-center min-w-0 flex-1 max-w-16">
              <div
                className={`${color} w-8 sm:w-12 rounded-t-lg shadow-sm hover:opacity-80 transition-all duration-1000 ease-out`}
                style={{
                  height: isAnimated ? bar.height : "0px",
                  transitionDelay: `${index * 0.2}s`,
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium truncate">{bar.month}</span>
              <span className="text-xs text-gray-400 truncate">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-w-0">
      {/* Top Bar - Hidden on mobile, shown on desktop */}
      <header className="hidden lg:block bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Dashboard</h1>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B65FCF] focus:border-transparent w-48"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 bg-[#B65FCF] rounded-full flex items-center justify-center text-white hover:bg-[#A855F7] transition-colors flex-shrink-0">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-4 lg:p-6 min-w-0">
        {/* Mobile title */}
        <div className="lg:hidden mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard Overview</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {renderStatsCards()}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {renderChart(
              "Registered Users",
              [
                { month: "Jan", value: 150, height: "72px" },
                { month: "Feb", value: 250, height: "120px" },
                { month: "Mar", value: 350, height: "168px" },
                { month: "Apr", value: 420, height: "200px" },
                { month: "May", value: 380, height: "182px" },
              ],
              "bg-[#B65FCF] hover:bg-[#A855F7]",
            )}

            {renderChart(
              "Active Users",
              [
                { month: "Jan", value: 120, height: "80px" },
                { month: "Feb", value: 180, height: "120px" },
                { month: "Mar", value: 220, height: "146px" },
                { month: "Apr", value: 300, height: "200px" },
                { month: "May", value: 280, height: "186px" },
              ],
              "bg-[#8B5CF6] hover:bg-[#7C3AED]",
            )}

          <div className="lg:col-span-2 xl:col-span-1">
            {renderChart(
              "Blocked Users",
              [
                { month: "Jan", value: 5, height: "50px" },
                { month: "Feb", value: 8, height: "80px" },
                { month: "Mar", value: 12, height: "120px" },
                { month: "Apr", value: 20, height: "200px" },
                { month: "May", value: 15, height: "150px" },
              ],
              "bg-[#A78BFA] hover:bg-[#8B5CF6]",
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
