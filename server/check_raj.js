const mongoose = require('mongoose');
const Client = require('./models/Client');
require('dotenv').config();

async function checkRaj() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        const raj = await Client.findOne({ 'personalInfo.name': /raj/i });
        if (!raj) {
            console.log("Raj not found");
        } else {
            console.log("Raj Data:", JSON.stringify({
                name: raj.personalInfo.name,
                paymentStatus: raj.paymentStatus,
                membership: raj.membership,
                memberships: raj.memberships
            }, null, 2));
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkRaj();
