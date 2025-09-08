const Response = require("@avv-2301/gamers-vault-common");
const Constant = require("@avv-2301/gamers-vault-common");
const { callService } = require("@avv-2301/gamers-vault-common");
const User = require("../../models/auth");
const {
  userSignUpValidation,
  passwordFieldValidation,
  loginValidation,
} = require("../../services/Validation");
const bcrypt = require("bcrypt");
const zxcvbn = require("zxcvbn");
const UserLoginHistory = require("../../models/loginHistory");
const { issueToken } = require("../../services/userJwt");
const axios = require("axios");
const ip = require("ip");

module.exports = {
  /**
   * @description This function is used to register user
   * @param req
   * @param res
   */
  userSignUp: async (req, res) => {
    try {
      const requestParams = req.body;
      // console.log(requestParams, "SIGN-UP PARAMS FROM BODY");

      if (
        !requestParams.name ||
        !requestParams.email ||
        !requestParams.password ||
        !requestParams.confirmPassword
      ) {
        return Response.errorResponseData(
          res,
          "All fields Required",
          Constant.STATUS_CODES.BAD_REQUEST
        );
      }

      userSignUpValidation(requestParams, res, async (validate) => {
        if (validate) {
          if (requestParams.password != requestParams.confirmPassword) {
            return Response.errorResponseData(
              res,
              "Password Not matched",
              Constant.STATUS_CODES.NOT_ACCEPTABLE
            );
          }
          const findUser = await User.findOne(
            { email: requestParams.email },
            {
              email: 1,
              verified: 1,
            }
          );

          if (findUser && findUser.verified != null) {
            return Response.successResponseWithoutData(
              res,
              "User already exist",
              Constant.STATUS_CODES.BAD_REQUEST
            );
          } else {
            const result = zxcvbn(requestParams?.password);
            if (result?.score < 2) {
              return Response.errorResponseWithoutData(
                res,
                "Password to weak",
                Constant.STATUS_CODES.NOT_ACCEPTABLE
              );
            }
            const Hash_Password = await bcrypt.hash(requestParams.password, 10);

            let userObj = {
              name: requestParams?.name,
              email: requestParams?.email,
              password: Hash_Password,
              verified: Constant.FLAGS.TRUE,
              authType: Constant.AUTH_TYPE.DIRECT,
              role: Constant.ROLE.USER,
              status: Constant.FLAGS.ACTIVE,
            };

            const userResponse = await User.create(userObj); //user created

            //calling profile service so that user profile is created
            const profileResponse = await callService(
              "profiles",
              "/create-profile",
              {
                name: requestParams?.name,
                userId: userResponse?._id,
                email: requestParams?.email,
              },
              { "x-internal-call": "true" },
              "POST"
            );

            return Response.successResponseData(
              res,
              { userResponse: userResponse, profileResponse: profileResponse },
              Constant.STATUS_CODES.CREATED,
              "User Registered successfully"
            );
          }
        }
      });
    } catch (error) {
      console.log(error);
      return Response.errorResponseData(
        res,
        error.message,
        Constant.STATUS_CODES.INTERNAL_SERVER
      );
    }
  },

  /**
   * @description This function is used to login user
   * @param req
   * @param res
   */
  login: async (req, res) => {
    try {
      const requestParams = req.body;

      if (!requestParams?.email || !requestParams?.password) {
        return Response.errorResponseData(
          res,
          "All Fields Required",
          Constant.STATUS_CODES.NO_CONTENT
        );
      }

      const rememberMe = requestParams?.rememberMe;
      // console.log(rememberMe, "REMEMBER");

      loginValidation(requestParams, res, async (validate) => {
        if (validate) {
          const user = await User.findOne({ email: requestParams?.email });
          // console.log(user, "USER DATAAA");

          let system_ip = ip.address(); //system ip address

          //get browser ip address
          let browser_ip = await axios.get(
            "https://api.ipify.org/?format=json"
          );

          if (user && user?.role === Constant.ROLE.USER) {
            if (user && user?.verified !== null) {
              if (user && user?.status === Constant.FLAGS.ACTIVE) {
                const comparePassword = await bcrypt.compare(
                  requestParams?.password,
                  user.password
                );
                if (comparePassword) {
                  const expiresIn = rememberMe ? 60 * 60 * 24 * 15 : 60 * 60;
                  console.log(expiresIn);
                  const userExpTime = Math.floor(Date.now() / 1000) + expiresIn;
                  console.log(userExpTime);

                  const payload = {
                    id: user?._id,
                    role: user?.role,
                    expiry: userExpTime,
                  };

                  const token = issueToken(payload);

                  const meta = { token };
                  let tokenUpdate = {};

                  tokenUpdate = {
                    $set: {
                      last_login: new Date(),
                      token: token,
                      tokenExpiresAt: userExpTime,
                      "ip_address.system_ip": system_ip,
                      "ip_address.browser_ip": browser_ip?.data?.ip,
                    },
                  };

                  let loginHistory = await UserLoginHistory.findOne({
                    userId: user?._id,
                  });
                  let loginHistoryObject = {};

                  if (loginHistory) {
                    loginHistoryObject = {
                      loginDetails: {
                        ip_address: {
                          system_ip: system_ip,
                          browser_ip: browser_ip?.data?.ip,
                        },
                        last_login: new Date(),
                      },
                    };

                    let update = {};
                    if (loginHistory?.loginDetails?.length !== 100) {
                      tenRecords = loginHistoryObject;
                      update = {
                        $push: {
                          loginDetails: loginHistoryObject?.loginDetails,
                        },
                      };
                    } else {
                      update = {
                        $set: {
                          loginDetails: [],
                        },
                      };
                    }

                    await UserLoginHistory.updateOne(
                      { userId: user._id },
                      update
                    );
                  } else {
                    loginHistoryObject = {
                      userId: user._id,
                      loginDetails: {
                        ip_address: {
                          system_ip: system_ip,
                          browser_ip: browser_ip?.data?.ip,
                        },
                        last_login: new Date(),
                      },
                    };

                    const history = await UserLoginHistory.create(
                      loginHistoryObject
                    );
                    tokenUpdate.$set.loginHistory = history?._id;
                  }
                  await User.updateOne({ _id: user?._id }, tokenUpdate);

                  return Response.successResponseData(
                    res,
                    user,
                    Constant.STATUS_CODES.SUCCESS,
                    "Login Successfull",
                    meta
                  );
                } else {
                  return Response.validationErrorResponseData(
                    res,
                    "Password Not Correct",
                    Constant.STATUS_CODES.UNAUTHORIZED
                  );
                }
              } else {
                return Response.errorResponseWithoutData(
                  res,
                  "User is InActive",
                  Constant.STATUS_CODES.BAD_REQUEST
                );
              }
            } else {
              return Response.errorResponseWithoutData(
                res,
                "User is not Verified",
                Constant?.STATUS_CODES.BAD_REQUEST
              );
            }
          } else {
            return Response.errorResponseWithoutData(
              res,
              "Access denied",
              Constant.STATUS_CODES.BAD_REQUEST
            );
          }
        }
      });
    } catch (error) {
      console.log(error);
      return Response.errorResponseData(
        res,
        error.message,
        Constant.STATUS_CODES.INTERNAL_SERVER
      );
    }
  },

  /**
   * @description This function is used to logout user
   * @param req
   * @param res
   */
  logout: async (req, res) => {
    try {
      const requestParams = req.body;
      if (!requestParams?.userId) {
        return Response.errorResponseWithoutData(
          res,
          "User Id required",
          Constant.STATUS_CODES.NO_CONTENT
        );
      }
      logoutValidation(requestParams, res, async (validate) => {
        if (validate) {
          const findUser = await User.findOne(
            { _id: requestParams?.userId },
            { _id: 1 }
          );
          if (!findUser) {
            return Response.errorResponseWithoutData(
              res,
              "User not found",
              Constant.STATUS_CODES.NO_CONTENT
            );
          }
          //logic for logout user
          return Response.successResponseWithoutData(
            res,
            "User logged out successfully",
            Constant.STATUS_CODES.SUCCESS
          );
        }
      });
    } catch (error) {
      console.log(error);
      return Response.errorResponseData(
        res,
        error.message,
        Constant.STATUS_CODES.INTERNAL_SERVER
      );
    }
  },

  /**
   * @description This function is used to check password strength
   * @param req
   * @param res
   */
  checkPasswordStrength: async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return Response.errorResponseWithoutData(
          res,
          "Password field is empty",
          Constant.STATUS_CODES.NO_CONTENT
        );
      }

      passwordFieldValidation(password, res, async (validate) => {
        if (validate) {
          const result = zxcvbn(password);

          return Response.successResponseWithData(
            res,
            { score: result?.score, feedback: result?.feedback },
            "Password strength",
            Constant.STATUS_CODES.SUCCESS
          );
        }
      });
    } catch (error) {
      console.log(error);
      return Response.errorResponseData(
        res,
        error.message,
        Constant.STATUS_CODES.INTERNAL_SERVER
      );
    }
  },
};
