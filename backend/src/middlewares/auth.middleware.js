const jwt = require("jsonwebtoken");
const tokenBlacklictModel = require("../models/blackList.model")

async function authUser(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not provided",
    });
  }

  const isTokenBlacklisted = await tokenBlacklictModel.findOne({token})
  
  if(isTokenBlacklisted){
    return res.status(401).json({
        message: "Token is invalid"
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
    });
  }
}

module.exports = { authUser };
