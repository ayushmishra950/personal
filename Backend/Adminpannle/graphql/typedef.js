const { gql } = require("apollo-server-express");

const adminTypeDefs = gql`
  type Admin {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    phoneNumber: String!
    createdAt: String
    updatedAt: String
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



  type Post {
    id: ID!
    caption: String
    imageUrl: String
    videoUrl: String
    thumbnailUrl: String
    isVideo: Boolean
    createdBy: User
    createdAt: String
    likes: [Like]
    comments: [Comment]
  }


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
    bio: String
    isOnline: Boolean           # Online status field
    lastActive: String          # Last active timestamp
    followers: [User]           # Suggestion System Support
    following: [User]           # Suggestion System Support
    posts: [Post]               # Added to support searchUsers query
    videos: [Video]
     is_blocked: Boolean       # User's videos
  }

  type Category {
    id: ID!
    name: String!
    createdBy: User!
    createdAt: String!
  }

  input CreateCategoryInput {
    name: String!
  }

  


  type AuthPayload {
    token: String!
    admin: Admin!
  }

  input RegisterAdminInput {
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    phoneNumber: String!
  }

  input LoginAdminInput {
    email: String!
    password: String!
  }

  type Query {
    admin(id: ID!): Admin
    allUsers : Int
    totalPosts: Int
    BlockCount: Int
     getUserLikedPosts(userId: ID!): [Post!]!
     getUserCommentedPosts(userId: ID!): [Post!]!
     getUserLikedVideos(userId: ID!): [Post!]!
     getUserLikedReels(userId: ID!): [Video!]!
     getUserCommentedReels(userId: ID!): [Video!]!
     getUserCommentedVideos(userId: ID!): [Post!]!
     getAllCategories: [Category!]!
    getCategoryById(id: ID!): Category
  }

  type Mutation {
    registerAdmin(input: RegisterAdminInput!): AuthPayload!
    loginAdmin(input: LoginAdminInput!): AuthPayload!
    blockUser(userId: ID!): User
    unblockUser(userId: ID!): User
     DeletePost(id: ID!,type: String!) : String!
     createCategory(name: String!, userId: ID!): Category!
    deleteCategory(id: ID!, userId: ID!): Boolean!
  }
`;

module.exports = adminTypeDefs;
