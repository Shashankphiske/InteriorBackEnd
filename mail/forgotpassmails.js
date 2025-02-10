const { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./mailtemplates");
const { mailsender } = require("./mailsetup");
require("dotenv").config();

const sendForgotPasswordMail = async (token, email) => {
    const emailcontent = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", `http://localhost:5174/resetpassword/${token}`);

    console.log(token,email);
    try{
        const response = await mailsender.sendMail({
            to : email,
            from : process.env.user,
            subject : "Reset password for Interior Project",
            html : emailcontent,
        });
        console.log("Password reset mail sent successfully");
        return response;
    }
    catch(error){
        console.log("Error in sending forgot password email");
    }
}

const sendPasswordResetSuccessMail = async (email, name) => {
    const emailcontent = PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{name}", name);

    try{
        const response = await mailsender.sendMail({
            to : email,
            from : process.env.user,
            subject : "Password for Interior Project changes successfully",
            html : emailcontent,
        });

        console.log("Password change mail sent successfully");

        return response;
    }
    catch (error){
        console.log("Error in sending password change success mail :", error);
    }
}

module.exports = { sendForgotPasswordMail, sendPasswordResetSuccessMail };