const Response = require("@avv-2301/gamers-vault-common");
const Constant = require("@avv-2301/gamers-vault-common");
const { callService } = require("@avv-2301/gamers-vault-common");
const User = require("../../models/auth");
const {
  userSignUpValidation,
  passwordFieldValidation,
} = require("../../services/Validation");
const bcrypt = require("bcrypt");
const zxcvbn = require("zxcvbn");

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
              verified: Constant.FLAGS.FALSE,
              authType: Constant.AUTH_TYPE.DIRECT,
              role: Constant.ROLE.USER,
              status: Constant.FLAGS.INACTIVE,
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
              {},
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
