

module.exports = function(req, res, next) {
  if (req.user && req.user.is_blocked) {
    if (req.originalUrl === '/graphql') {
      return res.status(403).json({ message: "You are blocked by admin." });
    }

    return res.render('blocked', {
      message: "You have been blocked by admin."
    });
  }
  next();
};
