const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/lib/db/models/User").default;
const Student = require("../src/lib/db/models/Student").default;
const School = require("../src/lib/db/models/School").default;
const Class = require("../src/lib/db/models/Class").default;
const connectDB = require("../src/lib/db/connect").default;

async function seedDemoUsers() {
    await connectDB();
    console.log("Connected to DB");

    const school = await School.findOne({ slug: "demo-school" });
    if (!school) {
        console.error("Demo school not found. Please run seed.ts first.");
        process.exit(1);
    }

    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // 0. Create a Dummy Class
    let demoClass = await Class.findOne({ name: "Grade 10", school: school._id });
    if (!demoClass) {
        demoClass = await Class.create({
            name: "Grade 10",
            school: school._id
        });
    }

    // 1. Create a Dummy Student Record
    let student = await Student.findOne({ admissionNumber: "STU001" });
    if (!student) {
        student = await Student.create({
            school: school._id,
            admissionNumber: "STU001",
            firstName: "John",
            lastName: "Doe",
            gender: "Male",
            dob: new Date("2010-01-01"),
            email: "student@demo.com",
            phone: "1234567890",
            status: "Admitted", // Fixed enum value
            class: demoClass._id, // Required field
            guardians: []
        });
        console.log("Created Student record");
    }

    // 2. Create Student User Account
    const studentUser = await User.findOneAndUpdate(
        { email: "student@demo.com" },
        {
            name: "John Doe",
            email: "student@demo.com",
            passwordHash: hashedPassword,
            role: "STUDENT",
            school: school._id,
            linkedStudentId: student._id,
            isActive: true
        },
        { upsert: true, new: true }
    );
    console.log("Created/Updated Student User account");

    // 3. Create Parent User Account
    const parentUser = await User.findOneAndUpdate(
        { email: "parent@demo.com" },
        {
            name: "Richard Doe",
            email: "parent@demo.com",
            passwordHash: hashedPassword,
            role: "PARENT",
            school: school._id,
            children: [student._id],
            isActive: true
        },
        { upsert: true, new: true }
    );
    console.log("Created/Updated Parent User account");

    console.log("\n--- Demo Credentials ---");
    console.log("Student Login:");
    console.log("  URL: /portal/login");
    console.log("  Email: student@demo.com");
    console.log("  Password: " + password);
    console.log("\nParent Login:");
    console.log("  URL: /portal/login");
    console.log("  Email: parent@demo.com");
    console.log("  Password: " + password);

    process.exit(0);
}

seedDemoUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
