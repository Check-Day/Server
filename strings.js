/** @format */

let constants = {
  successServer:
    "Server is Successfully Running, and App is listening on port ",
  serverError: "Error occurred, server can't start",
  successConnection: "Connected Successfully",
  authServer: "Auth Server",
  mainServer: "Main Server",
  methodNotAllowed: "Method not Allowed",
  callbackURL: "http://localhost:5969/auth/login-redirect",
  loginService: "google",
  loginRequestElements: ["email", "profile"],
  successRedirection: "/user/",
  failureRedirection: "/auth/login",
  logoutMessage: "Logged Out Successfully",
  logoutErrorMessage: "Error Logging Out. Please try again.",
  redirectionAfterLogout: "/auth/login",
  directToIndex: "/user/index",
  noLogArray: ["/favicon.ico"],
  loginSuccessMessage: "Logged in Successfully",
};

module.exports = constants;
