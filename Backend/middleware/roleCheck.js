// middleware/roleCheck.js
const checkRole = (allowedRoles) => (resolver) => async (parent, args, context, info) => {
  if (!allowedRoles.includes(context.role)) {
    throw new Error('Access Denied: Insufficient Role');
  }
  return resolver(parent, args, context, info);
};

module.exports = checkRole;
