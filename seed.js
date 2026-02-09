const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for seeding...");

        // 1. Create a School
        const School = mongoose.connection.collection('schools');
        const User = mongoose.connection.collection('users');

        const schoolName = "Main School";
        const email = "admin@school.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const schoolResult = await School.insertOne({
            name: schoolName,
            slug: "main",
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const schoolId = schoolResult.insertedId;

        await User.insertOne({
            name: "Master Admin",
            email: email,
            passwordHash: hashedPassword,
            role: "SCHOOL_ADMIN",
            school: schoolId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("-----------------------------------------");
        console.log("✅ SEEDING SUCCESSFUL!");
        console.log(`School: ${schoolName} (slug: main)`);
        console.log(`Admin Email: ${email}`);
        console.log(`Admin Password: ${password}`);
        console.log("-----------------------------------------");
        console.log("You can now log in at http://localhost:3004/login");

        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
}

seed();
