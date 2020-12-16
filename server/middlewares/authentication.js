const jwt = require('jsonwebtoken');

// ============================
//  Verify token
// ============================
let verifyToken = (req, res, next) => {
  let token = req.get('token');

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Invalid token',
        },
      });
    }
    req.user = decoded.user;

    next();
  });
};

// =====================
// Verify AdminRole
// =====================
let verifyAdminRole = (req, res, next) => {
  let user = req.user;
  // role of the new user: req.body.role
  // role of the user logged in: req.user.role
  // data in the body => req.body
  // data in the header => req.get('param_name')

  if (user.role === 'ADMIN_ROLE') {
    next();
  } else {
    return res.json({
      ok: false,
      err: {
        message: 'The user must be an administrator',
      },
    });
  }
};

// =====================
// Verify token by URL
// =====================
let verifyTokenURL = (req, res, next) => {
  let token = req.query.token;

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Invalid token',
        },
      });
    }

    //remove this line?
    req.usuario = decoded.usuario;

    next();
  });
};

module.exports = {
  verifyToken,
  verifyAdminRole,
  verifyTokenURL,
};
