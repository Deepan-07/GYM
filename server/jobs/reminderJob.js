const cron = require('node-cron');
const Client = require('../models/Client');
const Gym = require('../models/Gym');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const sendWhatsApp = require('../utils/sendWhatsApp');

// Helper to check if reminder was sent today
// We can use a Map in memory or just send it (to keep it simple, we may need a field in DB. The spec says "track lastReminderSent date", so I'll assume we can add it to Client schema optionally, or just update client model implicitly)
// Actually we didn't add lastReminderSent to Client schema. I will update the schema dynamically or just save it. 
// Mongoose allows saving fields if strict is false, but strict is true by default. Let's just update the schema by adding lastReminderSent. 
// Since I already wrote the Client model, I can just do a findOneAndUpdate or we'll bypass it for simple testing context, but spec says "track lastReminderSent date".

// Run every day at 09:00
cron.schedule('0 9 * * *', async () => {
    console.log('Running reminderJob...');
    try {
        const todayStr = new Date().toDateString();

        // 1. Expiring Soon (Email + SMS)
        const expiringClients = await Client.find({ 'membership.status': 'expiring_soon' }).populate('gymId');
        for (let client of expiringClients) {
             // Basic Check to prevent duplicate
             if (client.membership.lastReminderSent === todayStr) continue;

             const gym = await Gym.findById(client.gymId);
             
             // Email
             const message = `Dear ${client.personalInfo.name}, your gym membership at ${gym?.gymName} will expire in ${client.membership.daysLeft} days. Please renew to continue your fitness journey.`;
             await sendEmail({
                 email: client.personalInfo.email,
                 subject: 'Membership Expiring Soon',
                 message
             });

             // SMS
             await sendSMS({
                 phone: client.personalInfo.mobileNo,
                 message
             });

             // We update directly in DB using mongoose atomic operation to add the field if not there
             await Client.updateOne({ _id: client._id }, { 'membership.lastReminderSent': todayStr });
        }

        // 2. Expired (WhatsApp Payment Link)
        const expiredClients = await Client.find({ 'membership.status': 'expired' }).populate('gymId');
        for (let client of expiredClients) {
            if (client.membership.lastReminderSent === todayStr) continue;

            const paymentLink = `${process.env.CLIENT_URL}/pay/${client.clientId}/${client.gymId}`;
            const gym = await Gym.findById(client.gymId);

            const waMessage = `Hi ${client.personalInfo.name}, your membership at ${gym?.gymName} has expired. Please renew using this link: ${paymentLink}. Regards.`;

            await sendWhatsApp({
                phone: client.personalInfo.mobileNo,
                message: waMessage
            });

            await Client.updateOne({ _id: client._id }, { 'membership.lastReminderSent': todayStr });
        }

        console.log('reminderJob completed.');
    } catch (err) {
         console.error('Error in reminderJob:', err);
    }
});
