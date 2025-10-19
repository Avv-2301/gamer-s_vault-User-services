const Response = require("@avv-2301/gamers-vault-common");
const Constant = require("@avv-2301/gamers-vault-common");
const User = require("../../models/auth");
const { loginValidation } = require("../../services/Validation");
const UserLoginHistory = require("../../models/loginHistory");
const { issueToken } = require("../../services/userJwt");
const axios = require("axios");
const ip = require("ip");
const bcrypt = require("bcrypt");

module.exports = {
  /**
   * @description This function is used to login admin
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

      loginValidation(requestParams, res, async (validate) => {
        if (validate) {
          const user = await User.findOne({ email: requestParams?.email });
          // console.log(user, "USER DATAAA");

          let system_ip = ip.address(); //system ip address

          //get browser ip address
          let browser_ip = await axios.get(
            "https://api.ipify.org/?format=json"
          );

          if (user && user?.role === Constant.ROLE.ADMIN) {
            if (user && user?.verified !== null) {
              if (user && user?.status === Constant.FLAGS.ACTIVE) {
                const comparePassword = await bcrypt.compare(
                  requestParams?.password,
                  user.password
                );
                if (comparePassword) {
                  const expiresIn = 60 * 60;
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
};
