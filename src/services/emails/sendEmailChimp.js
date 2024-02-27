const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

//send emails to all users from the mailchimp audience list
const SendEmailChimpToALL = async (receiver, subject, code) => {
  try {
    const response = await mailchimp.campaigns.create({
      type: "regular",
      recipients: {
        list_id: process.env.MAILCHIMP_AUDIENCE_ID,
      },
      settings: {
        subject_line: subject,
        from_name: "Abdullah",
        reply_to: receiver,
      },
    });

    const campaignId = response.id;

    // Add dynamic content to the email (HTML or plain text)
    const contentResponse = await mailchimp.campaigns.setContent(campaignId, {
      html: `<p>Your dynamic email content goes here. Code: ${code}</p>`,
    });
    console.log("Email content added successfully:", contentResponse);

    // Send the email
    const sendResponse = await mailchimp.campaigns.send(campaignId);

    console.log("Marketing email sent successfully:", sendResponse);
  } catch (error) {
    console.error("Error sending marketing email:", error);
  }
};

//send single email to a single user
const SendEmailChimp = async (receiver, subject, code) => {
  try {
    const response = await mailchimp.messages.send({
      message: {
        subject: subject,
        text: `Your dynamic email content goes here. Code: ${code}`,
        to: [{ email: receiver }],
      },
    });

    console.log("Transactional email sent successfully:", response);
  } catch (error) {
    console.error(
      "Error sending transactional email:",
      error.response ? error.response.body : error.message
    );
  }
};

module.exports = { SendEmailChimpToALL, SendEmailChimp };
