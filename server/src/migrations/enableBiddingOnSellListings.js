/**
 * Migration Script: Enable bidding on existing sell listings
 * 
 * This script updates all existing sell listings that have isBiddable=false
 * to isBiddable=true, so tenants can place bids on them.
 * 
 * Run with: node server/src/migrations/enableBiddingOnSellListings.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/Property.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all sell listings that have isBiddable = false or undefined
        const result = await Property.updateMany(
            {
                listingType: 'sell',
                $or: [
                    { isBiddable: false },
                    { isBiddable: { $exists: false } }
                ]
            },
            {
                $set: { isBiddable: true }
            }
        );

        console.log(`Migration complete!`);
        console.log(`Updated ${result.modifiedCount} sell listings to enable bidding.`);
        console.log(`Matched ${result.matchedCount} documents.`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrate();
