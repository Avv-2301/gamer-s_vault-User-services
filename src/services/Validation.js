const Joi = require("joi");
const Response = require("../../../common/services/Response");
const Constant = require("../../../common/services/Constant");

module.exports = {
  /**
   * @description This function is used to validate the user Signup function
   * @param req
   * @param res
   */

  userSignUpValidation: (req, res, callback) => {
    const schema = Joi.object({
      name: Joi.string().trim().required(),
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().min(8).required(),
      confirmPassword: Joi.string().trim().min(8).required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        "All fields are required",
        Constant.NOT_ACCEPTABLE
      );
    }
    return callback(true);
  },

  /**
   * @description This function is to validate the fields for login function
   * @param req
   * @param res
   */
  loginValidation: (req, res, callback) => {
    const schema = Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().trim().min(8).required(),
    });

    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        "all fields are required",
        Constant.NOT_ACCEPTABLE
      );
    }
    return callback(true);
  },

  /**
   * @description This function is to validate the fields for logout function
   * @param req
   * @param res
   */

  logoutValidation: (req, res, callback) => {
    const schema = Joi.object({
      user_id: Joi.string().trim().required(),
    });
    const { error } = schema.validate(req);
    if (error) {
      return Response.validationErrorResponseData(
        res,
        "UserId is not in proper format",
        Constant.NOT_ACCEPTABLE
      );
    }
    return callback(true);
  },
};
