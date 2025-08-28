const bcrypt = require('bcryptjs');
const User = require('../Models/user');
const { sendOtpMail } = require('../Utils/otp');
const { user_token } = require('../Utils/token');
require('dotenv').config();

const { GraphQLUpload } = require('graphql-upload');
const Post = require('../Models/Post');
const Video = require('../Models/Video');
const Notification = require('../Models/Notification');
const { uploadToCloudinary } = require('../Utils/cloudinary');

const otpStore = {};

// Auto-clean expired OTPs
setInterval(() => {
  const now = new Date();
  Object.keys(otpStore).forEach(email => {
    if (otpStore[email].expiry < now) delete otpStore[email];
  });
}, 5 * 60 * 1000);

const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    getFollowers: async (_, { userId }, { }) => {
      if (!userId) throw new AuthenticationError("Not logged in");
      const user = await User.findById(userId).populate("followers");
      return user.followers;
    },
    getHiddenFromStory: async (_, { userId }, { }) => {
      if (!userId) throw new AuthenticationError("Not logged in");
      const user = await User.findById(userId).populate("hiddenFromStory");
      return user.hiddenFromStory;
    },
mySelf: async (_, { userId }, { dataSources }) => {
      // Example using a data source or DB service
      // You can also replace this with Prisma, Mongoose, etc.
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        isPrivate : user.isPrivate,
      };
    },

    allSavedReels: async (_, {userId}, context) => {
    
    if (!userId) throw new Error("Authentication required");

    const userDoc = await User.findById(userId).populate('saveReels');
    return userDoc.saveReels;
  },
    getArchivedPosts: async (_, { userId }) => {
      return await Post.find({ createdBy: userId, isArchived: true });
    },
    getSavedPosts: async (_, { userId }) => {
      const user = await User.findById(userId).populate("bookmarks");
      return user.bookmarks;
    },

    users: async () =>
      await User.find().select('id name username email phone profileImage is_blocked bio createTime isOnline lastActive').populate('posts', 'id').populate('blockedUsers', 'id name username profileImage'),

      getMe: async (_, args, { user }) => {
        try {
          if (!user) {
            throw new Error('Authentication required');
          }

          const currentUser = await User.findOne({ _id: user.id })
            .populate('posts')
            .populate('followers')
            .populate('following');
          
          console.log(`🔍 getMe for user ${currentUser.name}:`);
          console.log(`👥 Following count: ${currentUser.following?.length || 0}`);
          console.log(`👥 Following users:`, currentUser.following?.map(f => ({ id: f._id, name: f.name })) || []);
          
          return currentUser;
        } catch(error) {
          console.log('Error in getMe:', error);
          throw error;
        }
      
      },
  
   getAllPosts: async (_, { userId }) => {
  try {

    const posts = await Post.find({ createdBy: userId })
  .sort({ createdAt: -1 })
  // .limit(1)
  .populate("createdBy", "id name username profileImage")
  .populate("likes.user", "id name username profileImage")
  .populate("comments.user", "id name username profileImage")
  .populate("comments.likes.user", "id name username profileImage")
  .populate("comments.replies.user", "id name username profileImage")
  .populate("comments.replies.likes.user", "id name username profileImage");


    // ✅ Add isVideo flag to posts based on whether they have videoUrl
    const postsWithFlag = posts.map(post => ({
      ...post._doc,
      id: post._id,
      isVideo: !!post.videoUrl // true if post has video, false otherwise
    }));

    return postsWithFlag;
  } catch (error) {
    console.error('getAllPosts error:', error);
    throw new Error('Failed to fetch posts');
  }
},

// user notifications code 


getUserNotifications: async (_, { userId }) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'id name username profileImage')
      .populate('post', 'id caption imageUrl videoUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications.map(notification => {
      const notificationObj = {
        ...notification._doc,
        id: notification._id.toString(),
        recipient: {
          ...notification.recipient,
          id: notification.recipient._id.toString()
        }
      };

      // Convert sender IDs
      if (notification.sender) {
        notificationObj.sender = {
          ...notification.sender._doc,
          id: notification.sender._id.toString()
        };
      }

      // Convert post IDs
      if (notification.post) {
        notificationObj.post = {
          ...notification.post._doc,
          id: notification.post._id.toString()
        };
      }

      // Convert commentId if it exists
      if (notification.commentId) {
        notificationObj.commentId = notification.commentId.toString();
      }

      return notificationObj;
    });
  } catch (error) {
    console.error('getUserNotifications error:', error);
    throw new Error('Failed to fetch notifications');
  }
},

// Get unread notifications count
getUnreadNotificationsCount: async (_, { userId }) => {
  try {
    const user = await User.findById(userId);
    return user ? user.unreadNotifications : 0;
  } catch (error) {
    console.error('getUnreadNotificationsCount error:', error);
    throw new Error('Failed to get unread count');
  }
},

// Get comment details with likes and replies
getCommentDetails: async (_, { postId, commentId }) => {
  try {
    const post = await Post.findById(postId)
      .populate("comments.user", "id name username profileImage")
      .populate("comments.likes.user", "id name username profileImage")
      .populate("comments.replies.user", "id name username profileImage")
      .populate("comments.replies.likes.user", "id name username profileImage");

    if (!post) throw new Error("Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new Error("Comment not found");

    // Convert all IDs to strings
    const commentObj = {
      ...comment._doc,
      id: comment._id.toString(),
      user: {
        ...comment.user._doc,
        id: comment.user._id.toString()
      },
      likes: comment.likes.map(like => ({
        ...like._doc,
        id: like._id.toString(),
        user: {
          ...like.user._doc,
          id: like.user._id.toString()
        }
      })),
      replies: comment.replies.map(reply => ({
        ...reply._doc,
        id: reply._id.toString(),
        user: {
          ...reply.user._doc,
          id: reply.user._id.toString()
        },
        likes: reply.likes.map(replyLike => ({
          ...replyLike._doc,
          id: replyLike._id.toString(),
          user: {
            ...replyLike.user._doc,
            id: replyLike.user._id.toString()
          }
        }))
      }))
    };

    return commentObj;
  } catch (error) {
    console.error('getCommentDetails error:', error);
    throw new Error('Failed to get comment details');
  }
}, // end code here


searchUsers: async (_, { username, userId }) => {
  try {
    // Step 1: Get current user’s blockedUsers & blockedBy
    const currentUser = await User.findById(userId).select('blockedUsers blockedBy');

    const blockedUserIds = currentUser?.blockedUsers?.map(id => id.toString()) || [];
    const blockedByUserIds = currentUser?.blockedBy?.map(id => id.toString()) || [];

    // Step 2: Merge both lists
    const allBlockedIds = [...new Set([...blockedUserIds, ...blockedByUserIds])];

    // Step 3: Search and exclude these IDs + current user
    const users = await User.find({
      $or: [
        { name: { $regex: username, $options: 'i' } },
        { username: { $regex: username, $options: 'i' } }
      ],
      _id: { $nin: [...allBlockedIds, userId] }
    })
      .select('id name username email phone isPrivate is_blocked profileImage bio createTime followers following posts')
      .populate('followers', 'id name')
      .populate('following', 'id name')
      .populate('blockedUsers', 'id username')
      .populate({
        path: 'posts',
        select: 'id caption imageUrl createdAt likes comments',
        populate: [
          {
            path: 'likes.user',
            select: 'id name username profileImage'
          },
          {
            path: 'comments.user',
            select: 'id name username profileImage'
          }
        ]
      })
      .limit(10);

    return users;
  } catch (error) {
    console.error('Search users error:', error);
    throw new Error('Failed to search users');
  }
},

    suggestedUsers: async (_, { userId }) => {
      try {
        const currentUser = await User.findById(userId).populate("following");
        if (!currentUser) throw new Error("User not found");

        const userFollowings = currentUser.following.map(u => u._id.toString());
        const potentialSuggestionsMap = {};

        for (let followedUserId of userFollowings) {
          const followedUser = await User.findById(followedUserId).populate("following");
          if (!followedUser) continue;

          followedUser.following.forEach(targetUser => {
            const id = targetUser._id.toString();
            if (
              id !== userId &&
              !userFollowings.includes(id) &&
              id !== currentUser._id.toString()
            ) {
              potentialSuggestionsMap[id] = (potentialSuggestionsMap[id] || 0) + 1;
            }
          });
        }

        const suggestedUserIdsWithScore = Object.entries(potentialSuggestionsMap)
          .sort((a, b) => b[1] - a[1]) // sort by mutual count
          .map(([id, score]) => ({ id, score }));

        // If suggestions exist
        if (suggestedUserIdsWithScore.length > 0) {
          // Fetch full user data and attach score
          const users = await User.find({
            _id: { $in: suggestedUserIdsWithScore.map(u => u.id) }
          })
          .populate('followers', 'id name')
          .populate('following', 'id name')
          .populate('blockedUsers', 'id username')
          .populate({
            path: 'posts',
            select: 'id caption imageUrl createdAt likes comments',
            populate: [
              {
                path: 'likes.user',
                select: 'id name username profileImage'
              },
              {
                path: 'comments.user',
                select: 'id name username profileImage'
              }
            ]
          });

          // Attach score and id to each user
          const usersWithScore = users.map(user => {
            const scoreObj = suggestedUserIdsWithScore.find(u => u.id === user._id.toString());
            return {
              ...user._doc,
              id: user._id.toString(), // ✅ Required fix
              suggestionScore: scoreObj ? scoreObj.score : 0
            };
          });

          return usersWithScore.sort((a, b) => b.suggestionScore - a.suggestionScore);
        }

        const fallbackUsers = await User.find({
          _id: { $nin: [...userFollowings, currentUser._id] }
        })
        .populate('followers', 'id name')
        .populate('following', 'id name')
        .populate('blockedUsers', 'id username')
        .populate({
          path: 'posts',
          select: 'id caption imageUrl createdAt likes comments',
          populate: [
            {
              path: 'likes.user',
              select: 'id name username profileImage'
            },
            {
              path: 'comments.user',
              select: 'id name username profileImage'
            }
          ]
        })
        .limit(5);
        console.log(fallbackUsers);

        // ✅ Add id here too
        return fallbackUsers.map(u => ({
          ...u._doc,
          id: u._id.toString(),
          suggestionScore: 0
        }));

        
      } catch (err) {
        console.error('suggestedUsers resolver error:', err);
        throw err;
      }
    },

  //   getUserInformation: async (_, { id }) => {
  //     const user = await User.findById(id);
  //     if (!user) throw new Error("User not found");
  //     return user;
  //   },
  // },

  getUserInformation: async (_, { id }) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_blocked) {
      throw new Error("User is blocked by Admin");
    }

    return user;
  } catch (error) {
    throw new Error(error.message || "Something went wrong");
  }
},
  },

  Mutation: {
    requestOtp: async (_, { name, username, email, password, phone }) => {
      if (await User.findOne({ email })) throw new Error('User with this email already exists');
      if (await User.findOne({ username })) throw new Error('Username already taken');

      const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOtpMail(email, otp);

      otpStore[email] = {
        otp,
        name,
        username,
        email,
        password,
        phone,
        expiry: new Date(Date.now() + 2 * 60 * 1000),
      };

      return { email, otp, otpExpiryTime: otpStore[email].expiry };
    },

    registerUser: async (_, { email, otp }, { res }) => {
      const entry = otpStore[email];
      if (!entry) throw new Error('No OTP requested');
      if (new Date() > entry.expiry) throw new Error('OTP expired');
      if (parseInt(otp) !== entry.otp) throw new Error('OTP not matched');
      if (await User.findOne({ email: entry.email })) throw new Error('User already exists');

      const user = new User({
        name: entry.name,
        username: entry.username,
        email: entry.email,
        password: await bcrypt.hash(entry.password, 10),
        phone: entry.phone,
        otp: entry.otp,
        createTime: new Date(),
        otpExpiryTime: entry.expiry,
      });

      await user.save();
      delete otpStore[email];

      const token = user_token(user);
      res.cookie("token", token);

      return user;
    },

   login: async (_, { email, password }, { res }) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }

  // ✅ Block check pehle hi lagao
  if (user.is_blocked) {
    throw new Error('User is blocked by admin');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = user_token(user);
  res.cookie("token", token);
  return user;
},


    logout: async (_, __, { res }) => {
      res.clearCookie("token");
      return "User logged out successfully";
    },

    changePassword: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
         const otp = Math.floor(100000 + Math.random() * 900000);
      await sendOtpMail(email, otp);

      return { email, otp,expiry: new Date(Date.now() + 2 * 60 * 1000) };
    },

        newPassword: async (_, { email,newPassword }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      user.password = await bcrypt.hash(newPassword, 6);
      await user.save();
      return 'Password updated successfully';
    },


updateUserPrivacy: async (_, { userId, isPrivate }) => {
  try {
    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update the field directly
    user.isPrivate = isPrivate;
    await user.save();

    return "Private account status updated successfully";
  } catch (error) {
    throw new Error(`Failed to update privacy: ${error.message}`);
  }
},

hideStoryFrom: async (_, { userIds,currentUserId}, { currentUser }) => {
      if (!currentUserId) throw new AuthenticationError("Not logged in");

      const user = await User.findById(currentUserId);

      // Filter only valid followers
      const validUserIds = userIds.filter(id => user.followers.includes(id));

      user.hiddenFromStory = validUserIds;
      await user.save();

      return "Story hidden from selected users.";
    },

block: async (_, { targetUserId, userId }) => {
  if (!userId || !targetUserId) throw new Error("Missing userId or targetUserId");

  if (userId === targetUserId) {
    throw new Error("You can't block yourself");
  }

  const currentUser = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) throw new Error("User not found");

  // Already blocked?
  if (currentUser.blockedUsers.includes(targetUserId)) {
    throw new Error("User already blocked");
  }

  // ✅ Add block
  currentUser.blockedUsers.push(targetUserId);

  // ✅ Only add to blockedBy if not already there
  if (!targetUser.blockedBy.includes(userId)) {
    targetUser.blockedBy.push(userId);
  }

  await currentUser.save();
  await targetUser.save();

  return "User blocked successfully";
},

unblock: async (_, { targetUserId, userId }) => {
  if (!userId || !targetUserId) throw new Error("Missing userId or targetUserId");

  const currentUser = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!targetUser) throw new Error("User not found");

  // ✅ Remove from blockedUsers of currentUser
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    id => id.toString() !== targetUserId
  );

  // ✅ Remove from blockedBy of targetUser
  targetUser.blockedBy = targetUser.blockedBy.filter(
    id => id.toString() !== userId
  );

  await currentUser.save();
  await targetUser.save();

  return "User unblocked successfully";
},


    createPost: async (_, { id, caption, image, video, thumbnail }) => {
      let imageUrl = null;
      let videoUrl = null;
      let thumbnailUrl = null;
      
      if (image) {
        imageUrl = await uploadToCloudinary(image, 'image');
      }

      if (video) {
        if (video.size > 300 * 1024 * 1024) {
          throw new Error("Video should be under 300MB");
        }
        const videoResponse = await uploadToCloudinary(video, 'video');
        // Extract just the URL from the response object
        videoUrl = videoResponse.url;
      }

      // Handle thumbnail for video posts
      if (thumbnail) {
        thumbnailUrl = await uploadToCloudinary(thumbnail, 'image');
      }

      if (!imageUrl && !videoUrl) {
        throw new Error('Either image or video must be provided');
      }
      
      const post = await Post.create({ 
        caption, 
        imageUrl, 
        videoUrl, 
        thumbnailUrl, 
        createdBy: id 
      });
      await User.findByIdAndUpdate(id, { $push: { posts: post._id } });
      return post;
    },

   // 📌 Save Post Resolver
savePost: async (_, { userId, postId }) => {
  try {
    if (!userId || !postId) {
      throw new Error("Missing userId or postId");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!Array.isArray(user.bookmarks)) {
      user.bookmarks = [];
    }

    const alreadyBookmarked = user.bookmarks.some(
      (id) => id.toString() === postId.toString()
    );

    if (!alreadyBookmarked) {
      user.bookmarks.push(postId);
      await user.save();
    }

    return "Post saved successfully.";
  } catch (error) {
    console.error("Error in savePost:", error);
    throw new Error("Failed to save post.");
  }
}
,

// ❌ Unsave Post Resolver
unsavePost: async (_, { userId, postId }) => {
  try {
    if (!userId || !postId) {
      throw new Error("Missing userId or postId");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!Array.isArray(user.bookmarks)) {
      user.bookmarks = [];
    }

    const beforeCount = user.bookmarks.length;

    // Filter out the postId
    user.bookmarks = user.bookmarks.filter(
      (savedId) => savedId.toString() !== postId.toString()
    );

    const afterCount = user.bookmarks.length;

    // Save only if something was actually removed
    if (beforeCount !== afterCount) {
      await user.save();
      return "Post removed from bookmarks.";
    } else {
      return "Post was not bookmarked.";
    }

  } catch (error) {
    console.error("Error in unsavePost:", error);
    throw new Error("Failed to unsave post.");
  }
},
saveReel: async (_, { reelId,userId }, context) => {
      try {
        if (!userId) {
          return "Authentication required" 
        }

        // Check if reel exists
        const reel = await Video.findById(reelId);
        if (!reel) {
          return  "Reel not found"
        }

        // Check if already saved
        const userDoc = await User.findById(userId);
        const alreadySaved = userDoc.saveReels.includes(reelId);

        if (alreadySaved) {
          return " Reel already saved" 
        }

        userDoc.saveReels.push(reelId);
        await userDoc.save();

        return "Reel saved successfully"
      } catch (err) {
        console.error(err);
        return "Something went wrong"
      }
    },

    unsaveReel: async (_, { reelId,userId }, context) => {
      try {
        if (!userId) {
          return  "Authentication required" 
        }

        await User.findByIdAndUpdate(userId, {
          $pull: { saveReels: reelId },
        });

        return  "Reel unsaved successfully"
      } catch (err) {
        console.error(err);
        return "Something went wrong" 
      }
    },

archivePost: async (_, { postId,userId }, { user }) => {
      try {
        const post = await Post.findOne({ _id: postId, createdBy: userId });
        if (!post) {
          throw new Error("Post not found");
        }

        post.isArchived = true;
        await post.save();
        return "Post Archived successfully";
      } catch (error) {
        console.error("Error archiving post:", error);
        throw new Error("Failed to archive post");
      }
    },

    unarchivePost: async (_, { postId,userId }, { user }) => {
      try {
        const post = await Post.findOne({ _id: postId, createdBy: userId });
        if (!post) {
          throw new Error("Post not found");
        }

        post.isArchived = false;
        await post.save();
        return "Post unArchived successfully";
      } catch (error) {
        console.error("Error unarchiving post:", error);
        throw new Error("Failed to unarchive post");
      }
    },

    
    DeletePost: async (_, { id}) => {      
      const deletePost = await Post.findByIdAndDelete(id);

if (deletePost) {
  const user = await User.findById(deletePost.createdBy);
  

  if (user) {
    user.posts = user.posts.filter(
      postId => postId.toString() !== deletePost._id.toString()
    );

    await user.save(); // 🔥 Ye important hai
  }
}
      return "DeletePost Successfully..."
    },

     CommentPost : async (_, { userId, postId, text }, context) => {
  if (!userId || !postId || !text.trim()) {
    throw new Error("Missing fields");
  }

  // 1. Create new comment
  const newComment = {
    user: userId,
    text,
    commentedAt: new Date(),
  };

  // 2. Find post and push comment
  const post = await Post.findById(postId).populate('createdBy', 'id name username');
  if (!post) throw new Error("Post not found");

  post.comments.push(newComment);
  await post.save();

  // Get the created comment ID
  const createdComment = post.comments[post.comments.length - 1];

  // 🔔 Create notification for post owner (if not commenting on own post)
  if (post.createdBy._id.toString() !== userId) {
    try {
      const notification = new Notification({
        recipient: post.createdBy._id,
        sender: userId,
        type: 'comment',
        message: 'commented on your post',
        post: postId,
        commentId: createdComment._id,
        commentText: text
      });
      await notification.save();
      
      // Get populated notification data
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'id name username profileImage')
        .populate('post', 'id caption imageUrl videoUrl');

      console.log('🔔 Comment notification created:', populatedNotification);

      // 🚀 EMIT REAL-TIME NOTIFICATION
      const io = context.req?.app?.get('io');
      if (io) {
        const recipientId = post.createdBy._id.toString();
        console.log('🚀 Emitting comment notification to user:', recipientId);
        
        io.to(recipientId).emit('newNotification', {
          id: populatedNotification._id.toString(),
          type: 'comment',
          sender: {
            id: populatedNotification.sender._id.toString(),
            name: populatedNotification.sender.name,
            username: populatedNotification.sender.username,
            profileImage: populatedNotification.sender.profileImage
          },
          post: {
            id: populatedNotification.post._id.toString(),
            caption: populatedNotification.post.caption
          },
          commentId: createdComment._id.toString(),
          commentText: text.trim(),
          createdAt: populatedNotification.createdAt.toISOString(),
          isRead: false
        });
        
        console.log('✅ Comment notification emitted successfully');
      } else {
        console.log('❌ Socket.io not available for comment notification');
      }
      
      // Increment unread count for recipient
      await User.findByIdAndUpdate(post.createdBy._id, {
        $inc: { unreadNotifications: 1 }
      });
    } catch (notificationError) {
      console.error('Error creating comment notification:', notificationError);
    }
  }

  // await post.populate("comments.user");

  return post.comments;
},

    LikePost: async (_, { userId, postId }, context) => {
   
  if (!userId || !postId) {
    throw new Error("userId and postId are required");
  }

  try {
    const post = await Post.findById(postId).populate('createdBy', 'id name username');

    if (!post) {
      throw new Error("Post not found");
    }

    const alreadyLiked = post.likes.some(like => like.user.toString() === userId);

    if (alreadyLiked) {
    // user unlike kar rha hai
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: userId, likedAt: new Date() });
      
      // 🔔 Create notification for post owner (if not liking own post)
      if (post.createdBy._id.toString() !== userId) {
        try {
          const notification = new Notification({
            recipient: post.createdBy._id,
            sender: userId,
            type: 'like',
            message: 'liked your post',
            post: postId
          });
          await notification.save();
          
          // Get populated notification data
          const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'id name username profileImage')
            .populate('post', 'id caption imageUrl videoUrl');

          console.log('🔔 Like notification created:', populatedNotification);

          // 🚀 EMIT REAL-TIME NOTIFICATION
          const io = context.req?.app?.get('io');
          if (io) {
            const recipientId = post.createdBy._id.toString();
            console.log('🚀 Emitting like notification to user:', recipientId);
            
            io.to(recipientId).emit('newNotification', {
              id: populatedNotification._id.toString(),
              type: 'like',
              sender: {
                id: populatedNotification.sender._id.toString(),
                name: populatedNotification.sender.name,
                username: populatedNotification.sender.username,
                profileImage: populatedNotification.sender.profileImage
              },
              post: {
                id: populatedNotification.post._id.toString(),
                caption: populatedNotification.post.caption
              },
              createdAt: populatedNotification.createdAt.toISOString(),
              isRead: false
            });
            
            console.log('✅ Like notification emitted successfully');
          } else {
            console.log('❌ Socket.io not available for like notification');
          }
          
          // Increment unread count for recipient
          await User.findByIdAndUpdate(post.createdBy._id, {
            $inc: { unreadNotifications: 1 }
          });
        } catch (notificationError) {
          console.error('Error creating like notification:', notificationError);
        }
      }
    }

    await post.save();
    
    return alreadyLiked ? "Unliked" : "Liked";
  } catch (error) {
    console.error("Like error:", error);
    throw new Error("Something went wrong while liking the post");
  }
},

    editProfile: async (_, { id, username, name, caption, image }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");
      if (name) user.name = name;
      if (username && username !== user.username) {
        // Only check username uniqueness if it's being changed
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          throw new Error("Username already taken");
        }
        user.username = username;
      }
      if (caption) user.bio = caption;
      if (image) user.profileImage = await uploadToCloudinary(image);
      await user.save();
      return user;
    },

    followAndUnfollow: async (_, { id }, context) => {
      if (!context?.user?.id) throw new Error("Unauthorized");
      const reqUserId = context.user.id;
      if (reqUserId === id) throw new Error("You cannot follow yourself");

      const [currentUser, targetUser] = await Promise.all([
        User.findById(reqUserId),
        User.findById(id),
      ]);

      if (!currentUser || !targetUser) throw new Error("User not found");

      const isFollowing = currentUser.following.includes(id);

      if (isFollowing) {
        await Promise.all([
          User.updateOne({ _id: reqUserId }, { $pull: { following: id } }),
          User.updateOne({ _id: id }, { $pull: { followers: reqUserId } }),
        ]);
      } else {
        await Promise.all([
          User.updateOne({ _id: reqUserId }, { $push: { following: id } }),
          User.updateOne({ _id: id }, { $push: { followers: reqUserId } }),
        ]);
        
        // 🔔 Create follow notification
        try {
          const notification = new Notification({
            recipient: id,
            sender: reqUserId,
            type: 'follow',
            message: 'started following you'
          });
          await notification.save();
          
          // Get populated notification data
          const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'id name username profileImage');

          console.log('🔔 Follow notification created:', populatedNotification);

          // 🚀 EMIT REAL-TIME NOTIFICATION
          const io = context.req?.app?.get('io');
          if (io) {
            const recipientId = id.toString();
            console.log('🚀 Emitting follow notification to user:', recipientId);
            
            io.to(recipientId).emit('newNotification', {
              id: populatedNotification._id.toString(),
              type: 'follow',
              sender: {
                id: populatedNotification.sender._id.toString(),
                name: populatedNotification.sender.name,
                username: populatedNotification.sender.username,
                profileImage: populatedNotification.sender.profileImage
              },
              createdAt: populatedNotification.createdAt.toISOString(),
              isRead: false
            });
            
            console.log('✅ Follow notification emitted successfully');
          } else {
            console.log('❌ Socket.io not available for follow notification');
          }
          
          // Increment unread count for recipient
          await User.findByIdAndUpdate(id, {
            $inc: { unreadNotifications: 1 }
          });
        } catch (notificationError) {
          console.error('Error creating follow notification:', notificationError);
        }
      }

      return targetUser;
    },

    

    markNotificationsAsRead: async (_, { userId }) => {
      try {
        // Mark all notifications as read for this user
        await Notification.updateMany(
          { recipient: userId, isRead: false },
          { isRead: true }
        );
        
        // Reset unread count to 0
        await User.findByIdAndUpdate(userId, {
          unreadNotifications: 0
        });
        
        return "Notifications marked as read";
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw new Error('Failed to mark notifications as read');
      }
    },

    // Like a comment
    LikeComment: async (_, { userId, postId, commentId }, context) => {
      try {
        const post = await Post.findById(postId).populate('createdBy', 'id name username');
        if (!post) throw new Error("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) throw new Error("Comment not found");

        const alreadyLiked = comment.likes.some(like => like.user.toString() === userId);

        if (alreadyLiked) {
          // Unlike the comment
          comment.likes = comment.likes.filter(like => like.user.toString() !== userId);
        } else {
          // Like the comment
          comment.likes.push({ user: userId, likedAt: new Date() });
          
          // Create notification for comment owner (if not liking own comment)
          if (comment.user.toString() !== userId) {
            try {
              const notification = new Notification({
                recipient: comment.user,
                sender: userId,
                type: 'comment_like',
                message: 'liked your comment',
                post: postId,
                commentId: commentId
              });
              await notification.save();
              
              // Get populated notification data
              const populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'id name username profileImage')
                .populate('post', 'id caption imageUrl videoUrl');

              // Emit real-time notification
              const io = context.req?.app?.get('io');
              if (io) {
                const recipientId = comment.user.toString();
                io.to(recipientId).emit('newNotification', {
                  id: populatedNotification._id.toString(),
                  type: 'comment_like',
                  sender: {
                    id: populatedNotification.sender._id.toString(),
                    name: populatedNotification.sender.name,
                    username: populatedNotification.sender.username,
                    profileImage: populatedNotification.sender.profileImage
                  },
                  post: {
                    id: populatedNotification.post._id.toString(),
                    caption: populatedNotification.post.caption
                  },
                  createdAt: populatedNotification.createdAt.toISOString(),
                  isRead: false
                });
              }
              
              // Increment unread count for recipient
              await User.findByIdAndUpdate(comment.user, {
                $inc: { unreadNotifications: 1 }
              });
            } catch (notificationError) {
              console.error('Error creating comment like notification:', notificationError);
            }
          }
        }

        await post.save();
        return alreadyLiked ? "Comment unliked" : "Comment liked";
      } catch (error) {
        console.error('LikeComment error:', error);
        throw new Error('Failed to like comment');
      }
    },

    // Reply to a comment
    ReplyToComment: async (_, { userId, postId, commentId, text }, context) => {
      try {
        if (!text.trim()) throw new Error("Reply text cannot be empty");

        const post = await Post.findById(postId).populate('createdBy', 'id name username');
        if (!post) throw new Error("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) throw new Error("Comment not found");

        const newReply = {
          user: userId,
          text: text.trim(),
          repliedAt: new Date(),
          likes: []
        };

        comment.replies.push(newReply);
        await post.save();

        // Get the created reply with populated user data
        const updatedPost = await Post.findById(postId)
          .populate('comments.replies.user', 'id name username profileImage');
        
        const updatedComment = updatedPost.comments.id(commentId);
        const createdReply = updatedComment.replies[updatedComment.replies.length - 1];

        // Create notification for comment owner (if not replying to own comment)
        if (comment.user.toString() !== userId) {
          try {
            const notification = new Notification({
              recipient: comment.user,
              sender: userId,
              type: 'reply',
              message: 'replied to your comment',
              post: postId,
              commentId: commentId,
              commentText: text.trim()
            });
            await notification.save();
            
            // Get populated notification data
            const populatedNotification = await Notification.findById(notification._id)
              .populate('sender', 'id name username profileImage')
              .populate('post', 'id caption imageUrl videoUrl');

            // Emit real-time notification
            const io = context.req?.app?.get('io');
            if (io) {
              const recipientId = comment.user.toString();
              io.to(recipientId).emit('newNotification', {
                id: populatedNotification._id.toString(),
                type: 'reply',
                sender: {
                  id: populatedNotification.sender._id.toString(),
                  name: populatedNotification.sender.name,
                  username: populatedNotification.sender.username,
                  profileImage: populatedNotification.sender.profileImage
                },
                post: {
                  id: populatedNotification.post._id.toString(),
                  caption: populatedNotification.post.caption
                },
                commentId: commentId,
                commentText: text.trim(),
                createdAt: populatedNotification.createdAt.toISOString(),
                isRead: false
              });
            }
            
            // Increment unread count for recipient
            await User.findByIdAndUpdate(comment.user, {
              $inc: { unreadNotifications: 1 }
            });
          } catch (notificationError) {
            console.error('Error creating reply notification:', notificationError);
          }
        }

        return {
          ...createdReply._doc,
          id: createdReply._id.toString(),
          user: createdReply.user
        };
      } catch (error) {
        console.error('ReplyToComment error:', error);
        throw new Error('Failed to reply to comment');
      }
    },

    // Delete a reply
    DeleteReply: async (_, { userId, postId, commentId, replyId }) => {
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) throw new Error("Comment not found");

        const reply = comment.replies.id(replyId);
        if (!reply) throw new Error("Reply not found");

        // Check if user owns the reply
        if (reply.user.toString() !== userId) {
          throw new Error("You can only delete your own replies");
        }

        comment.replies.pull(replyId);
        await post.save();

        // Return updated comment with populated data
        const updatedPost = await Post.findById(postId)
          .populate('comments.user', 'id name username profileImage')
          .populate('comments.likes.user', 'id name username profileImage')
          .populate('comments.replies.user', 'id name username profileImage')
          .populate('comments.replies.likes.user', 'id name username profileImage');

        const updatedComment = updatedPost.comments.id(commentId);
        
        return {
          ...updatedComment._doc,
          id: updatedComment._id.toString(),
          user: updatedComment.user,
          likes: updatedComment.likes.map(like => ({
            ...like._doc,
            user: like.user
          })),
          replies: updatedComment.replies.map(reply => ({
            ...reply._doc,
            id: reply._id.toString(),
            user: reply.user,
            likes: reply.likes.map(replyLike => ({
              ...replyLike._doc,
              user: replyLike.user
            }))
          }))
        };
      } catch (error) {
        console.error('DeleteReply error:', error);
        throw new Error('Failed to delete reply');
      }
    },

    // Delete a comment
    DeleteComment: async (_, { userId, postId, commentId }) => {
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) throw new Error("Comment not found");

        // Check if user owns the comment or owns the post
        if (comment.user.toString() !== userId && post.createdBy.toString() !== userId) {
          throw new Error("You can only delete your own comments or comments on your posts");
        }

        post.comments.pull(commentId);
        await post.save();

        return "Comment deleted successfully";
      } catch (error) {
        console.error('DeleteComment error:', error);
        throw new Error('Failed to delete comment');
      }
    },

    // Like a reply
    LikeReply: async (_, { userId, postId, commentId, replyId }, context) => {
      try {
        const post = await Post.findById(postId);
        if (!post) throw new Error("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) throw new Error("Comment not found");

        const reply = comment.replies.id(replyId);
        if (!reply) throw new Error("Reply not found");

        const alreadyLiked = reply.likes.some(like => like.user.toString() === userId);

        if (alreadyLiked) {
          // Unlike the reply
          reply.likes = reply.likes.filter(like => like.user.toString() !== userId);
        } else {
          // Like the reply
          reply.likes.push({ user: userId, likedAt: new Date() });
          
          // Create notification for reply owner (if not liking own reply)
          if (reply.user.toString() !== userId) {
            try {
              const notification = new Notification({
                recipient: reply.user,
                sender: userId,
                type: 'reply_like',
                message: 'liked your reply',
                post: postId,
                commentId: commentId
              });
              await notification.save();
              
              // Get populated notification data
              const populatedNotification = await Notification.findById(notification._id)
                .populate('sender', 'id name username profileImage')
                .populate('post', 'id caption imageUrl videoUrl');

              // Emit real-time notification
              const io = context.req?.app?.get('io');
              if (io) {
                const recipientId = reply.user.toString();
                io.to(recipientId).emit('newNotification', {
                  id: populatedNotification._id.toString(),
                  type: 'reply_like',
                  sender: {
                    id: populatedNotification.sender._id.toString(),
                    name: populatedNotification.sender.name,
                    username: populatedNotification.sender.username,
                    profileImage: populatedNotification.sender.profileImage
                  },
                  post: {
                    id: populatedNotification.post._id.toString(),
                    caption: populatedNotification.post.caption
                  },
                  createdAt: populatedNotification.createdAt.toISOString(),
                  isRead: false
                });
              }
              
              // Increment unread count for recipient
              await User.findByIdAndUpdate(reply.user, {
                $inc: { unreadNotifications: 1 }
              });
            } catch (notificationError) {
              console.error('Error creating reply like notification:', notificationError);
            }
          }
        }

        await post.save();
        return alreadyLiked ? "Reply unliked" : "Reply liked";
      } catch (error) {
        console.error('LikeReply error:', error);
        throw new Error('Failed to like reply');
      }
    },
  },

  // ✅ NEWLY ADDED: Follower/Following Resolvers
  User: {
    id: (parent) => parent._id || parent.id,
    name: (parent) => parent.name || parent.username || "Unknown User",
    username: (parent) => parent.username || "unknown",
    email: (parent) => parent.email || "",
    followers: async (parent) => {
      const user = await User.findById(parent._id || parent.id).populate("followers");
      return user ? user.followers : [];
    },
    following: async (parent) => {
      const user = await User.findById(parent._id || parent.id).populate("following");
      return user ? user.following : [];
    },
  },

  // ✅ NEWLY ADDED: Post Resolvers for likes and comments
  Post: {
    likes: async (parent) => {
      if (parent.likes) {
        return parent.likes;
      }
      return [];
    },
    comments: async (parent) => {
      if (parent.comments) {
        return parent.comments;
      }
      return [];
    },
  },

  Like: {
    user: async (parent) => {
      if (parent.user && typeof parent.user === 'object') {
        return parent.user;
      }
      return null;
    },
    likedAt: (parent) => parent.likedAt,
  },

  Comment: {
    id: (parent) => parent._id || parent.id,
    user: async (parent) => {
      if (parent.user && typeof parent.user === 'object') {
        return parent.user;
      }
      return null;
    },
    commentedAt: (parent) => parent.commentedAt,
    likes: (parent) => parent.likes || [],
    replies: (parent) => parent.replies || [],
  },

  Reply: {
    id: (parent) => parent._id || parent.id,
    user: async (parent) => {
      if (parent.user && typeof parent.user === 'object') {
        return parent.user;
      }
      return null;
    },
    repliedAt: (parent) => parent.repliedAt,
    likes: (parent) => parent.likes || [],
  }
}

module.exports = resolvers;
