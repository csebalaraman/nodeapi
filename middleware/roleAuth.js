module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user role from database for current request
    const { User } = require('../models');
    
    User.findByPk(req.user.id).then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: 'Forbidden - insufficient permissions',
          requiredRole: allowedRoles,
          userRole: user.role
        });
      }

      req.user.role = user.role;
      next();
    }).catch(err => {
      console.error('ROLE CHECK ERROR 👉', err);
      res.status(500).json({ message: 'Server error' });
    });
  };
};
