const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@artacademy.com',
            password: 'admin123',
            role: 'admin'
        });

        // Create regular user
        const regularUser = new User({
            name: 'Student User',
            email: 'user@artacademy.com', 
            password: 'user123',
            role: 'user'
        });
        const regularUser2 = new User({
            name: 'Student User 2',
            email: 'user2@artacademy.com', 
            password: 'user1234',
            role: 'user'
        });

        await adminUser.save();
        await regularUser.save();
        await regularUser2.save();

        console.log('Demo users created successfully!');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

seedData();