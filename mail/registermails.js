const { mailsender } = require("./mailsetup");
const { VERIFICATION_EMAIL_TEMPLATE, WELCOME_MAIL } = require("./mailtemplates");
require("dotenv").config();

const sendVerificationMail = async (email, code) =>{

    const emailcontent = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", code);

    try{
        const response = await mailsender.sendMail({
            from : process.env.user,
            to : email,
            subject : "Verify your email",
            html : emailcontent,
        });

        console.log("Email sent successfully");
        return response;
    }catch (error){
        console.log("Error in sending verificaton email :",error);
    }

}

const sendWelcomeEmail = async (email, name) => {
    const emailcontent = WELCOME_MAIL.replace("{username}", name);

    try{
        const response = await mailsender.sendMail({
            to : email,
            from : process.env.user,
            subject : "Welcome to Interior Project",
            html : emailcontent,
        });
    
        console.log("Email sent successfully");
        return response;
    }
    catch (error){
        console.log("error in sending welcome email");
    }
}

module.exports = { sendVerificationMail, sendWelcomeEmail };