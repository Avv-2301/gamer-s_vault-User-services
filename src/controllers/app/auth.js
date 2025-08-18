const Response = require("../../../../common/services/Response");
const Constant = require("../../../../common/services/Constant");
const User = require("../../models/auth");
const { userSignUpValidation } = require("../../services/Validation");
const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports = {
  /**
   * @description This function is used to register user
   * @param req
   * @param res
   */
  userSignUp: async (req, res) => {
    try {
      const requestParams = req.body;
      console.log(requestParams, "SIGN-UP PARAMS FROM BODY");

      if (
        !requestParams.name ||
        !requestParams.email ||
        !requestParams.password ||
        !requestParams.confirmPassword
      ) {
        return Response.errorResponseData(
          res,
          "All fields Required",
          Constant.BAD_REQUEST
        );
      }

      userSignUpValidation(requestParams, res, async (validate) => {
        if (validate) {
          if (requestParams.password != requestParams.confirmPassword) {
            return Response.errorResponseData(
              res,
              "Password Not matched",
              Constant.NOT_ACCEPTABLE
            );
          }
          const findUser = await User.findOne(
            { email: requestParams.email },
            {
              email: 1,
              verified: 1,
            }
          );
          console.log(findUser, "USER DATA");

          if (findUser && findUser.verified != null) {
            return Response.successResponseWithoutData(
              res,
              "User already exist",
              Constant.BAD_REQUEST
            );
          } else {
            const Hash_Password = await bcrypt.hash(requestParams.password, 10);

            let userObj = {
              name: requestParams?.name,
              email: requestParams?.email,
              password: Hash_Password,
              verified: Constant.FALSE,
              authType: Constant.AUTH_TYPE.DIRECT,
              role: Constant.ROLE.USER,
              status: Constant.INACTIVE,
            };

            const userResponse = await User.create(userObj); //user created

            //calling profile service so that user profile is created
            await axios.post("http://localhost:4002/profile/create-profile", {
              userId: userResponse?._id,
              name: userResponse?.name,
              email: userResponse?.email,
            });

            return Response.successResponseData(
              res,
              userResponse,
              Constant.CREATED,
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
        Constant.INTERNAL_SERVER
      );
    }
  },
};
