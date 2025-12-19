import mongoose from 'mongoose';
import Wishlist from './server/src/models/Wishlist.js';

console.log('Checking Wishlist Schema...');
const paths = Wishlist.schema.paths;
const userExists = !!paths.user;
const propertyExists = !!paths.property;

if (userExists && propertyExists) {
    console.log('SUCCESS: user and property fields exist.');
    console.log('User Path:', paths.user.instance);
    console.log('Property Path:', paths.property.instance);
} else {
    console.error('FAILURE: Missing user or property fields.');
    console.log('Keys:', Object.keys(paths));
    process.exit(1);
}
