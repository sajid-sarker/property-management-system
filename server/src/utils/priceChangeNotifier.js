import Wishlist from "../models/Wishlist.js";
import Notification from "../models/Notification.js";

/**
 * Notify all users who have a property in their wishlist when its price changes
 * @param {String} propertyId - The ID of the property
 * @param {String} propertyTitle - The title of the property
 * @param {Number} oldPrice - The previous price
 * @param {Number} newPrice - The new price
 */
export const notifyPriceChange = async (propertyId, propertyTitle, oldPrice, newPrice) => {
    try {
        // Skip notification if price difference is negligible (less than $1)
        if (Math.abs(newPrice - oldPrice) < 1) {
            return;
        }

        // Find all wishlists containing this property
        const wishlists = await Wishlist.find({
            "properties.property": propertyId
        }).select("user properties");

        if (!wishlists || wishlists.length === 0) {
            console.log(`No wishlists contain property ${propertyId}`);
            return;
        }

        // Create notifications for each user
        const notifications = [];
        for (const wishlist of wishlists) {
            // Check if this specific property is in the wishlist
            const propertyInWishlist = wishlist.properties.find(
                (item) => item.property.toString() === propertyId.toString()
            );

            if (propertyInWishlist) {
                // Format price change message
                const priceDirection = newPrice > oldPrice ? "increased" : "decreased";
                const message = `Price ${priceDirection} for "${propertyTitle}": was $${oldPrice.toLocaleString()}, now $${newPrice.toLocaleString()}`;

                notifications.push({
                    user: wishlist.user,
                    message: message,
                    type: "price_change",
                    relatedId: propertyId,
                    isRead: false,
                });
            }
        }

        // Bulk create notifications
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`Created ${notifications.length} price change notifications for property ${propertyId}`);
        }
    } catch (error) {
        console.error("Error in notifyPriceChange:", error);
        // Don't throw - price change notifications are not critical to property updates
    }
};
