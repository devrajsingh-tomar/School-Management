const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createSuperAdmin() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");

        // Define schema properly or use collection directly
        const User = mongoose.connection.collection('users');

        const email = "super@admin.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log("Super Admin already exists. Updating role to SUPER_ADMIN...");
            await User.updateOne({ email }, {
                $set: {
                    role: 'SUPER_ADMIN',
                    passwordHash: hashedPassword // Reset password just in case
                }
            });
        } else {
            console.log("Creating new Super Admin...");
            await User.insertOne({
                name: "SaaS Super Admin",
                email: email,
                passwordHash: hashedPassword,
                role: "SUPER_ADMIN",
                school: null, // Super admin is system level, likely no specific school or a system school
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log("-----------------------------------------");
        console.log("✅ SUPER ADMIN READY!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

createSuperAdmin();
