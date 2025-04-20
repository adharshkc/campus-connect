module.exports = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    next();
  },
  
  isAdmin: (req, res, next) => {
    if (req.session.role !== 'admin') {
      return res.redirect('/login')
    }
    next();
  },
  
  isStaff: (req, res, next) => {
    if (req.session.role !== 'staff') {
      return res.status(403).send('Access denied');
    }
    next();
  },
  
  isStudent: (req, res, next) => {
    if (req.session.role !== 'student') {
      return res.status(403).send('Access denied');
    }
    next();
  },
  
  isStaffOrAdmin: (req, res, next) => {
    if (!['STAFF', 'ADMIN'].includes(req.session.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  }
};