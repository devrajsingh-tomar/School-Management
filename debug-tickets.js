const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkTickets() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // Define minimal schema to avoid model issues
        const schema = new mongoose.Schema({}, { strict: false });
        // Use existing collection 'supporttickets'
        const Ticket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', schema);

        console.log("Fetching all tickets...");
        const tickets = await Ticket.find({}).lean();

        console.log(`Found ${tickets.length} tickets.`);

        if (tickets.length > 0) {
            console.log("First ticket sample:");
            console.log(JSON.stringify(tickets[0], null, 2));

            const id = tickets[0]._id.toString();
            console.log(`Trying to find by ID: ${id}`);

            const found = await Ticket.findById(id).lean();
            console.log("Found by ID result:", found ? "YES" : "NO");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkTickets();
