const { Router } = require("express");
const {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
} = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", registerUserController);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", loginUserController);

/**
 * @route GET /api/auth/logout
 * @description logout user and add the token to blacklist
 * @access Public
 */
authRouter.get("/logout", logoutUserController);


/**
 * @route GET /api/auth/get-me
 * @description get the logged in user details
 * @access Private
 */
authRouter.get("/get-me", authUser, getMeController)

module.exports = authRouter;
