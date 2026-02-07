/**
 * Migration Script: Assign landlord to properties that don't have one
 * 
 * This script finds properties with missing landlord field and assigns them
 * to the first landlord user in the system (for testing purposes).
 * 
 * Run with: node server/src/migrations/fixMissingLandlords.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/Property.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find properties without a landlord
        const propertiesWithoutLandlord = await Property.find({
            $or: [
                { landlord: { $exists: false } },
                { landlord: null }
            ]
        });

        console.log(`Found ${propertiesWithoutLandlord.length} properties without landlord`);

        if (propertiesWithoutLandlord.length === 0) {
            console.log('No properties need updating.');
            return;
        }

        // Find a landlord user to assign
        const landlord = await User.findOne({ role: 'landlord' });

        if (!landlord) {
            console.error('No landlord user found in database. Please create a landlord user first.');
            return;
        }

        console.log(`Assigning properties to landlord: ${landlord.name} (${landlord._id})`);

        // Update all properties without landlord
        const result = await Property.updateMany(
            {
                $or: [
                    { landlord: { $exists: false } },
                    { landlord: null }
                ]
            },
            {
                $set: { landlord: landlord._id }
            }
        );

        console.log(`Migration complete!`);
        console.log(`Updated ${result.modifiedCount} properties.`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate();
