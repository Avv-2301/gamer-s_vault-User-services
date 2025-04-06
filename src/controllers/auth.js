const Response = require("../../../common/services/Response");
const Constant = require("../../../common/services/Constant");
const User = require("../models/auth");

module.exports = {
  userSignUp: async (req, res) => {
    try {
        const requestParams = req.body;
        console.log(requestParams, "SIGN-UP PARAMS FROM BODY");
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
