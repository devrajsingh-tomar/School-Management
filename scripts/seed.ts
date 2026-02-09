const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/lib/db/models/User").default;
const School = require("../src/lib/db/models/School").default;
const connectDB = require("../src/lib/db/connect").default;

async function seed() {
    await connectDB();
    console.log("Connected to DB");

    // Clear existing (optional, be careful in prod)
    // await User.deleteMany({});
    // await School.deleteMany({});

    // 1. Create Super Admin
    const superAdminEmail = "admin@saas.com";
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

    if (!existingSuperAdmin) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
            name: "Super Admin",
            email: superAdminEmail,
            passwordHash: hashedPassword,
            role: "SUPER_ADMIN",
            isActive: true,
        });
        console.log("Created Super Admin");
    } else {
        console.log("Super Admin already exists");
    }

    // 2. Create Demo School
    const schoolSlug = "demo-school";
    let school = await School.findOne({ slug: schoolSlug });

    if (!school) {
        school = await School.create({
            name: "Demo International School",
            slug: schoolSlug,
            contactEmail: "contact@demo.com",
            subscriptionPlan: "PREMIUM",
            settings: {
                themeColor: "#4F46E5",
            },
        });
        console.log("Created Demo School");
    } else {
        console.log("Demo School already exists");
    }

    // 3. Create School Admin
    const schoolAdminEmail = "admin@demo.com";
    const existingSchoolAdmin = await User.findOne({ email: schoolAdminEmail });

    if (!existingSchoolAdmin) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        await User.create({
            name: "Principal Skinner",
            email: schoolAdminEmail,
            passwordHash: hashedPassword,
            role: "SCHOOL_ADMIN",
            school: school!._id,
            isActive: true,
        });
        console.log("Created School Admin");
    } else {
        console.log("School Admin already exists");
    }

    console.log("Seeding complete");
    process.exit(0);
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
