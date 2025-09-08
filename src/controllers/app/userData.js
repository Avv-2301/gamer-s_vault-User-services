const User = require("../../models/auth");
const Response = require("@avv-2301/gamers-vault-common");
const Constant = require("@avv-2301/gamers-vault-common");
const { getuserValidation } = require("../../services/Validation");

module.exports = {
  /**
   * @description This function is responsible to get User data
   * @param req
   * @param res
   */

  getUserData: async (req, res) => {
    try {
      const userId = req.params.id;
      // console.log(userId, "PARAMS");

      if (!userId) {
        return Response.errorResponseData(
          res,
          "All fields Required",
          Constant.STATUS_CODES.NO_CONTENT
        );
      }

      //for projection token for mongodb to fetch only necessary fields
      const fields = req.query.projection
        ? req.query.projection.split(",")
        : [];

      //convert to mongodb projection
      const projection = fields.reduce((acc, f) => {
        acc[f.trim()] = 1;
        return acc;
      }, {});

      getuserValidation(userId, res, async (validate) => {
        if (validate) {
          const findUser = await User.findById(userId, projection);
          // console.log(findUser, "USER FOUND");

          return Response.successResponseData(
            res,
            findUser,
            Constant.STATUS_CODES.SUCCESS,
            "User found"
          );
        } else {
          return Response.errorResponseWithoutData(
            res,
            "User not found",
            Constant.STATUS_CODES.NO_CONTENT
          );
        }
      });
    } catch (error) {
      console.log(error);
      return Response.errorResponseData(
        res,
        "Internal Server Error",
        Constant.STATUS_CODES.INTERNAL_SERVER
      );
    }
  },
};
