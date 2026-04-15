const twilio = require('twilio');

const sendSMS = async (options) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[SMS MOCK] To: ${options.phone}, Message: ${options.message}`);
      return;
    }
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Ensure phone number has country code (+91 format)
    let formattedPhone = options.phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone; // Assuming India for default, adjust if needed
    }

    const messageResponse = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_SMS_FROM,
      to: formattedPhone
    });
    console.log(`SMS Sent: ${messageResponse.sid}`);
  } catch (error) {
    console.error('Error sending SMS: ', error);
  }
};

module.exports = sendSMS;
