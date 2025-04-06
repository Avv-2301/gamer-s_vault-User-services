const Response = require("../../../common/services/Response");
const Constant = require("../../../common/services/Constant");
const User = require("../models/auth");
const { userSignUpValidation } = require('../services/Validation');
const bcrypt = require('bcrypt');

module.exports = {
  userSignUp: async (req, res) => {
    try {
        const requestParams = req.body;
        console.log(requestParams, "SIGN-UP PARAMS FROM BODY");

        if(!requestParams.name ||
            !requestParams.email ||
            !requestParams.password ||
            !requestParams.confirmPassword
        ){
            return Response.errorResponseData(
                res,
                "All fields Required",
                Constant.NOT_ACCEPTABLE
            );
        }

        userSignUpValidation(requestParams, res, async(validate) =>{
            if(validate){
                if(requestParams.password != requestParams.confirmPassword){
                    return Response.errorResponseData(
                        res,
                        "Password Not matched",
                        Constant.NOT_ACCEPTABLE
                    )
                }
                const findUser = await User.findOne(
                    {email: requestParams.email},
                    {
                        email: 1,
                        verified: 1
                    }
                )
                console.log(findUser, "USER DATA")

                if(findUser && findUser.verified != null){
                    res,
                    "User is already signed-up",
                    Constant.FAIL
                }else{
                    const Hash_Password = await bcrypt.hash(requestParams.password, 10);

                    
                }
            }
        })
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
