// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Admin = require("../model/model"); // mongoose model
// const User = require('../../Models/user');
// const Post = require('../../Models/Post');
// const Block = require('../model/block'); // mongoose model for blocked users
// const mongoose = require("mongoose");
// const Video = require('../../Models/Video'); // Assuming you have a Video model
// const Category = require("../model/Category");


// const adminResolvers = {
//   Query: {

//     getAllCategories: async () => {
//       try {
//         const categories = await Category.find().sort({ createdAt: -1 }); // Latest pehle
//         return categories;
//       } catch (error) {
//         throw new Error("Failed to fetch categories: " + error.message);
//       }
//     },

//     // all users
//       allUsers: async () =>{
//  return await User.countDocuments();  
//       }, 
    
//     admin: async (_, { id }) => {
//       return await Admin.findById(id);
//     },
//      // All total posts
//     totalPosts: async () => {
//       return await Post.countDocuments();
//     },
//     // block user' count
//      BlockCount: async () => {
//       return await Block.countDocuments();
//     },
//     // userlike count
//      getUserLikedPosts: async (_, { userId }) => {
//       try {
//         // Ensure id is properly handled
//         const posts = await Post.find({
//             "likes.user": { $in: [new mongoose.Types.ObjectId(userId)] },
//             imageUrl: { $ne: null }
//         }).populate("likes", "_id username"); // sirf required fields populate karna

//         return posts;
//       } catch (error) {
//         throw new Error(error.message);
//       }
//     },

//     getUserCommentedPosts: async (_, { userId }) => {
//   try {
//     const posts = await Post.find({
//       "comments.user": userId,
//       imageUrl: { $ne: null } 
//     }).populate("createdBy", "username profilePic");

//     return posts;
//   } catch (error) {
//     console.error("Error fetching user commented posts:", error);
//     throw new Error("Failed to fetch user commented posts");
//   }
// },

// getUserLikedVideos: async (_, { userId }) => {
//   try {
//     const videos = await Post.find({
//       "likes.user": userId,
//        videoUrl: { $ne: null } 
//     }).populate("createdBy", "username ");

//     return videos;
//   } catch (error) {
//     throw new Error(error.message); /* CR  */
//   }
// },

// getUserLikedReels: async (_, { userId }) => {
//   try {
//     const videos = await Video.find({
//       "likes.user": userId,
//        videoUrl: { $ne: null } 
//     }).populate("createdBy", "username ");

//     return videos;
//   } catch (error) {
//     throw new Error(error.message); /* CR  */
//   }
// },


// getUserCommentedVideos: async (_, { userId }) => {
//   try {
//     const videos = await Post.find({
//       "comments.user": userId,
//       videoUrl: { $ne: null }    // sirf videos
//     });

//     return videos;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// },

// getUserCommentedReels: async (_, { userId }) => {
//   try {
//     const videos = await Video.find({
//       "comments.user": userId,
//       videoUrl: { $ne: null }    // sirf videos
//     });

//     return videos;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }



//   },

//   Mutation: {
//     // Register a new admin
//     registerAdmin: async (_, { input }) => {
//       const { firstname, lastname, email, password, phoneNumber } = input;

//       const existingAdmin = await Admin.findOne({ email });
//       if (existingAdmin) throw new Error("Admin already exists");

//       const hashedPassword = await bcrypt.hash(password, 10);
//       const newAdmin = new Admin({
//         firstname,
//         lastname,
//         email,
//         phoneNumber,
//         password: hashedPassword,
//       });

//       await newAdmin.save();

//       const token = jwt.sign(
//         { id: newAdmin._id, email: newAdmin.email },
//         "SECRET_KEY",
//         { expiresIn: "1d" }
//       );

//       return { token, admin: newAdmin };
//     },

//     // Login an existing admin
//     loginAdmin: async (_, { input }) => {
//       const { email, password } = input;

//       const admin = await Admin.findOne({ email });
//       if (!admin) throw new Error("Invalid email or password");

//       const valid = await bcrypt.compare(password, admin.password);
//       if (!valid) throw new Error("Invalid email or password");

//       const token = jwt.sign(
//         { id: admin._id, email: admin.email },
//         "SECRET_KEY",
//         { expiresIn: "1d" }
//       );

//       return { token, admin };
//     },
//   },

//   // block user 
//   Mutation: {
//     blockUser: async (_, { userId }) => {
//       const user = await User.findById(userId);
//       if (!user) throw new Error("User not found");

//       user.is_blocked = true;
//       await Block.create({ userId: user._id });
     
//       await user.save();

//       return user;
//     },

//    unblockUser: async (_, { userId }) => {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   // User ko unblock karna
//   user.is_blocked = false;

//   // Block collection se entry remove karna
//   await Block.deleteOne({ userId: user._id });

//   await user.save();

//   return user;
// },

//   DeletePost: async (_, { id,type}) => {  

//       if (!id || !type) throw new Error("Id or Type field not found");

//       if(type === 'posts'){

//       const deletePost = await Post.findByIdAndDelete(id);

// if (deletePost) {
//   const user = await User.findById(deletePost.createdBy);
  

//   if (user) {
//     user.posts = user.posts.filter(
//       postId => postId.toString() !== deletePost._id.toString()
//     );

//     await user.save(); // 🔥 Ye important hai
//   }
// }
//       return "DeletePost Successfully..."
// }
//     else if(type === 'reels'){
//   const deletePost = await Video.findByIdAndDelete(id);
// }
// return "DeleteVideo Successfully..."
//     },

//    createCategory: async (_, { name, userId }, context) => {
//   try {
//     if (!userId) {
//       throw new Error("Unauthorized. Please provide a valid userId");
//     }

//     const existing = await Category.findOne({ name });
//     if (existing) {
//       throw new Error("Category already exists");
//     }

//     const newCategory = await Category.create({
//       name,
//       createdBy: userId
//     });

//     return newCategory;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// },

// deleteCategory: async (_, { id, userId }, context) => {
//   try {
//     if (!userId) {
//       throw new Error("Unauthorized. Please provide a valid userId");
//     }

//     // Optionally, check if category exists before deleting
//     const category = await Category.findById(id);
//     if (!category) {
//       throw new Error("Category not found");
//     }

//     // Optional: Check if userId matches createdBy to allow only creator/admin to delete
//     if (category.createdBy.toString() !== userId) {
//       throw new Error("You do not have permission to delete this category");
//     }

//     await Category.findByIdAndDelete(id);
//     return true;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }




//   },
 

  


// };

// module.exports = adminResolvers;















const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../model/model");
const User = require('../../Models/user');
const Post = require('../../Models/Post');
const Block = require('../model/block');
const mongoose = require("mongoose");
const Video = require('../../Models/Video');
const Category = require("../model/Category");
const checkRole = require('../../middleware/roleCheck'); // ✅ role check

const adminResolvers = {
  Query: {
    getAllCategories: checkRole(['ADMIN'])(async () => {
      const categories = await Category.find().sort({ createdAt: -1 });
      return categories;
    }),

    allUsers: checkRole(['ADMIN'])(async () => {
      return await User.countDocuments();  
    }),

    admin: checkRole(['ADMIN'])(async (_, { id }) => {
      return await Admin.findById(id);
    }),

    totalPosts: checkRole(['ADMIN'])(async () => {
      return await Post.countDocuments();
    }),

    BlockCount: checkRole(['ADMIN'])(async () => {
      return await Block.countDocuments();
    }),

    getUserLikedPosts: checkRole(['ADMIN'])(async (_, { userId }) => {
      const posts = await Post.find({
        "likes.user": new mongoose.Types.ObjectId(userId),
        imageUrl: { $ne: null }
      }).populate("likes", "_id username");
      return posts;
    }),

    getUserCommentedPosts: checkRole(['ADMIN'])(async (_, { userId }) => {
      const posts = await Post.find({
        "comments.user": userId,
        imageUrl: { $ne: null }
      }).populate("createdBy", "username profilePic");
      return posts;
    }),

    getUserLikedVideos: checkRole(['ADMIN'])(async (_, { userId }) => {
      const videos = await Post.find({
        "likes.user": userId,
        videoUrl: { $ne: null }
      }).populate("createdBy", "username");
      return videos;
    }),

    getUserLikedReels: checkRole(['ADMIN'])(async (_, { userId }) => {
      const videos = await Video.find({
        "likes.user": userId,
        videoUrl: { $ne: null }
      }).populate("createdBy", "username");
      return videos;
    }),

    getUserCommentedVideos: checkRole(['ADMIN'])(async (_, { userId }) => {
      const videos = await Post.find({
        "comments.user": userId,
        videoUrl: { $ne: null }
      });
      return videos;
    }),

    getUserCommentedReels: checkRole(['ADMIN'])(async (_, { userId }) => {
      const videos = await Video.find({
        "comments.user": userId,
        videoUrl: { $ne: null }
      });
      return videos;
    }),
  },

  Mutation: {
    registerAdmin: async (_, { input }) => {
      const { firstname, lastname, email, password, phoneNumber } = input;
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) throw new Error("Admin already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        firstname,
        lastname,
        email,
        phoneNumber,
        password: hashedPassword,
      });

      await newAdmin.save();

      const token = jwt.sign(
        { id: newAdmin._id, email: newAdmin.email, role: "ADMIN" }, // ✅ include role
        "SECRET_KEY",
        { expiresIn: "1d" }
      );

      return { token, admin: newAdmin };
    },

    loginAdmin: async (_, { input }) => {
      const { email, password } = input;

      const admin = await Admin.findOne({ email });
      if (!admin) throw new Error("Invalid email or password");

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: "ADMIN" }, // ✅ include role
        "SECRET_KEY",
        { expiresIn: "1d" }
      );

      return { token, admin };
    },

    blockUser: checkRole(['ADMIN'])(async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.is_blocked = true;
      await Block.create({ userId: user._id });
      await user.save();
      return user;
    }),

    unblockUser: checkRole(['ADMIN'])(async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.is_blocked = false;
      await Block.deleteOne({ userId: user._id });
      await user.save();
      return user;
    }),

    DeletePost: checkRole(['ADMIN'])(async (_, { id, type }) => {
      if (!id || !type) throw new Error("Id or Type field not found");

      if (type === 'posts') {
        const deletePost = await Post.findByIdAndDelete(id);
        if (deletePost) {
          const user = await User.findById(deletePost.createdBy);
          if (user) {
            user.posts = user.posts.filter(
              postId => postId.toString() !== deletePost._id.toString()
            );
            await user.save();
          }
        }
        return "DeletePost Successfully...";
      } else if (type === 'reels') {
        await Video.findByIdAndDelete(id);
        return "DeleteVideo Successfully...";
      }

      throw new Error("Invalid type");
    }),

    createCategory: checkRole(['ADMIN'])(async (_, { name, userId }) => {
      const existing = await Category.findOne({ name });
      if (existing) {
        throw new Error("Category already exists");
      }

      const newCategory = await Category.create({
        name,
        createdBy: userId
      });

      return newCategory;
    }),

    deleteCategory: checkRole(['ADMIN'])(async (_, { id, userId }) => {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error("Category not found");
      }

      if (category.createdBy.toString() !== userId) {
        throw new Error("You do not have permission to delete this category");
      }

      await Category.findByIdAndDelete(id);
      return true;
    }),
  },
};

module.exports = adminResolvers;

