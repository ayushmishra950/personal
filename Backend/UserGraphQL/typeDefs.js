const { gql } = require("apollo-server-express");

const typeDefs = gql`

  type User {
    id: ID!
    name: String
    username: String
    email: String
    phone: String
    password: String
    createTime: String
    token: String
    profileImage: String
    role : String
    bio: String
    isOnline: Boolean           # Online status field
    isPrivate : Boolean
    lastActive: String          # Last active timestamp
    followers: [User]           # Suggestion System Support
    following: [User]           # Suggestion System Support
    posts: [Post]               # Added to support searchUsers query
    videos: [Video]
    bookmarks : [Post]        
    saveReels : [Video]  
    blockedUsers: [User]
    blockedBy: [User]
    hiddenFromStory : [User]  
     is_blocked: Boolean       # User's videos
  }

  type Story {
    id: ID!
    userId: ID!
    username: String!
    avatar: String!
    mediaType: String         # Optional: "image" | "video"
    mediaUrl: String          # Optional URL to the uploaded media
    caption: String           # Optional text or main content
    createdAt: String!
    isArchived: Boolean
    expiresAt: String!
    location: String
    viewers: [String]
    replies: [StoryReply]
  }

   type Video {
    id: ID!
    title: String!
    description: String
    videoUrl: String!
    thumbnailUrl: String
    duration: Float
    views: Int
    createdBy: User!
     isArchived: Boolean
    createdAt: String!
    updatedAt: String!
    likes: [VideoLike]
    comments: [VideoComment]
    tags: [String]
    category: String
    isPublic: Boolean
    fileSize: Float
    resolution: VideoResolution
  }



    type Notification {
    id: ID!
    recipient: User
    sender: User
    type: String
    message: String
    post: Post
    commentText: String
    commentId: ID
    isRead: Boolean
    createdAt: String
  }



  type OtpResponse {
    email: String!
    otp: Int!
    otpExpiryTime: String!
  }

  type Post {
    id: ID!
    caption: String
    imageUrl: String
    videoUrl: String
    thumbnailUrl: String
    isVideo: Boolean
    createdBy: User
    createdAt: String
    isArchived: Boolean
    likes: [Like]
    comments: [Comment]
  }

  type Like {
    user: User
    likedAt: String
  }

  type Comment {
    id: ID!
    text: String
    user: User
    commentedAt: String
    likes: [Like]
    replies: [Reply]
  }

  type Reply {
    id: ID!
    text: String
    user: User
    repliedAt: String
    likes: [Like]
  }



  type Query {
    users: [User]
    getMe: User
    getAllPosts(userId : ID): [Post]
    getFollowers(userId : ID): [User!]!
  getHiddenFromStory(userId : ID): [User!]!
    mySelf(userId : ID): User
    searchUsers(username: String!, userId: ID!): [User]
    suggestedUsers(userId: ID!): [User]
     getUserNotifications(userId: ID!): [Notification]
    getUnreadNotificationsCount(userId: ID!): Int
    getCommentDetails(postId: ID!, commentId: ID!): Comment
    getUserInformation(id: ID!): User
    getSavedPosts(userId: ID!): [Post]
    getArchivedPosts(userId: ID!): [Post]
    allSavedReels(userId: ID!): [Video!]!
    getSavedStory(id: ID!): Story
  }

  type Mutation {
    requestOtp(
      name: String!
      username: String!
      email: String!
      password: String!
      phone: String!
    ): OtpResponse

    registerUser(email: String!, otp: Int!): User

    login(email: String!, password: String!): User
    savePost(userId: ID!, postId: ID!): String
  unsavePost(userId: ID!, postId: ID!): String
  archivePost(postId: ID!, userId: ID!): String
    unarchivePost(postId: ID!, userId: ID!): String
        saveReel(reelId: ID!, userId: ID!): String
    unsaveReel(reelId: ID!, userId: ID!): String
     block(targetUserId: ID!,userId: ID!): String
  unblock(targetUserId: ID!, userId: ID!): String
  hideStoryFrom(userIds: [ID!]!,currentUserId: ID!): String


    logout: String

    changePassword(
      email: String!
    ): OtpResponse

     newPassword(
      email: String!
      newPassword: String!
    ): String
    updateUserPrivacy(userId: ID!, isPrivate: Boolean!): String

    createPost(id: ID, caption: String!, image: Upload, video: Upload, thumbnail: Upload): Post
    DeletePost(id: ID!) : String!
    LikePost(userId: ID!,postId: ID!) : String!
    CommentPost(userId: ID!,postId: ID!, text:String!):[Comment]!

    editProfile(
      id: ID
      name: String
      username: String
      caption: String
      image: Upload
    ): User

    followAndUnfollow(id: ID!): User
    markNotificationsAsRead(userId: ID!): String
    
    # Comment and Reply mutations
    LikeComment(userId: ID!, postId: ID!, commentId: ID!): String
    ReplyToComment(userId: ID!, postId: ID!, commentId: ID!, text: String!): Reply
    DeleteComment(userId: ID!, postId: ID!, commentId: ID!): String
    DeleteReply(userId: ID!, postId: ID!, commentId: ID!, replyId: ID!): Comment
    LikeReply(userId: ID!, postId: ID!, commentId: ID!, replyId: ID!): String
  }
`;

module.exports = typeDefs;

