const twilio = require('twilio');

const sendWhatsApp = async (options) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[WhatsApp MOCK] To: ${options.phone}, Message: ${options.message}`);
      return;
    }
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    let formattedPhone = options.phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone; 
    }

    const messageResponse = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedPhone}`
    });
    console.log(`WhatsApp Sent: ${messageResponse.sid}`);
  } catch (error) {
    console.error('Error sending WhatsApp: ', error);
  }
};

module.exports = sendWhatsApp;
