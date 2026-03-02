module.exports = function requireAdmin(req, res, next) {
  console.log(`Admin check - Session exists: ${!!req.session}, isAdmin: ${!!(req.session && req.session.isAdmin)}, sessionID: ${req.sessionID}`);
  
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    console.log('Admin access denied - no valid session');
    res.status(401).json({ 
      message: 'Unauthorized', 
      debug: {
        hasSession: !!req.session,
        isAdmin: !!(req.session && req.session.isAdmin),
        sessionID: req.sessionID || 'No session ID'
      }
    });
  }
};
