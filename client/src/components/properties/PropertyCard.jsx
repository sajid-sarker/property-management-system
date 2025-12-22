import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, HStack, Text, Icon, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaStar, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { propertyService } from '../../services/api';

/**
 * Reusable PropertyCard Component
 * Displays property information with boost/featured badge
 */
const PropertyCard = ({ data, index = 0 }) => {
    const { user } = useAuth();

    // Safety check
    if (!data) return null;

    // Debugging
    // console.log("PropertyCard:", { id: data._id, landlord: data.landlord, user: user?._id || user?.id });

    // Handle different data formats
    const propertyId = data._id || data.propertyId || data.id;
    const imageUrl = data.image || (data.images && data.images[0]) || 'https://placehold.co/400x300/14141f/d4af37?text=No+Image';
    const locationText = data.location || (data.address && `${data.address.city || ''}, ${data.address.state || ''}`) || 'Location N/A';
    const isBoosted = data.priority && data.priority > 1;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
        >
            <Box
                background="#14141f"
                borderRadius="8px"
                overflow="hidden"
                border={isBoosted ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.05)'}
                position="relative"
                transition="all 0.3s ease"
                _hover={{
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                }}
            >
                {/* Delete Button for Owner - OUTSIDE LINK for safety */}
                {data.landlord && (
                    (typeof data.landlord === 'object' ? data.landlord?._id : data.landlord)?.toString() === user?._id?.toString() ||
                    (typeof data.landlord === 'object' ? data.landlord?._id : data.landlord)?.toString() === user?.id?.toString()
                ) && (
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Stop event bubbling
                                if (window.confirm("Are you sure you want to delete this listing?")) {
                                    try {
                                        await propertyService.deleteProperty(propertyId);
                                        window.location.reload();
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to delete property");
                                    }
                                }
                            }}
                            style={{
                                position: "absolute",
                                top: "10px",
                                left: "10px",
                                zIndex: 100, // High Z-Index
                                background: "#ef4444", // Tailwind red-500
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "36px",
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
                            }}
                            title="Delete Property"
                        >
                            <FaTrash size={14} />
                        </button>
                    )}

                {/* Main Card Content Link */}
                <Link to={`/properties/${propertyId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>

                    {/* Featured Badge for Boosted Properties */}
                    {isBoosted && (
                        <Badge
                            position="absolute"
                            top="0"
                            right="0" // Changed to right to not overlap delete button
                            zIndex="10"
                            background="linear-gradient(135deg, #d4af37, #c5a028)"
                            color="#0a0a0f"
                            px="4"
                            py="2"
                            borderBottomLeftRadius="12px" // Adjusted radius
                            fontWeight="700"
                            fontSize="0.75rem"
                            textTransform="uppercase"
                            display="flex"
                            alignItems="center"
                            gap="1"
                            boxShadow="0 2px 10px rgba(212, 175, 55, 0.4)"
                        >
                            <FaStar size={10} /> Featured
                        </Badge>
                    )}

                    {/* Image Container */}
                    <Box height="280px" overflow="hidden" position="relative">
                        <Box
                            as="img"
                            src={imageUrl}
                            alt={data.title || 'Property'}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                            transition="transform 0.5s ease"
                            _hover={{ transform: 'scale(1.05)' }}
                        />

                        {/* Type Badge - Moved down slightly if needed, or kept same */}
                        <Badge
                            position="absolute"
                            top="50px" // Moved down to avoid overlap with Featured badge if both exist
                            right="4"
                            background="rgba(212, 175, 55, 0.9)"
                            color="#0a0a0f"
                            px="3"
                            py="1"
                            fontWeight="700"
                            borderRadius="4px"
                            fontSize="0.8rem"
                            textTransform="uppercase"
                        >
                            {data.type || (data.isForSale ? 'For Sale' : 'For Rent')}
                        </Badge>

                        {/* ... Rest of existing Image layout ... */}
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            right="0"
                            background="linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)"
                            p="4"
                            pt="8"
                        >
                            <Text color="#d4af37" fontWeight="600" fontSize="1.25rem">
                                {typeof data.price === 'number'
                                    ? `$${data.price.toLocaleString()}`
                                    : data.price || data.rentPrice || 'Price N/A'}
                            </Text>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box p="6">
                        <Flex justify="space-between" align="center" mb="2">
                            <Text
                                fontFamily="'Playfair Display', serif"
                                fontSize="1.25rem"
                                fontWeight="600"
                                color="white"
                                noOfLines={1}
                            >
                                {data.title || 'Untitled Property'}
                            </Text>
                        </Flex>

                        <HStack color="#a0a0a0" mb="4" fontSize="0.9rem">
                            <Icon color="#d4af37" boxSize="4">
                                <FaMapMarkerAlt />
                            </Icon>
                            <Text noOfLines={1}>{locationText}</Text>
                        </HStack>

                        {/* Property Features */}
                        <Flex
                            justify="space-between"
                            pt="4"
                            borderTop="1px solid rgba(255, 255, 255, 0.05)"
                            color="white"
                            fontSize="0.9rem"
                        >
                            <HStack gap="2">
                                <Icon color="#d4af37" boxSize="3">
                                    <FaBed />
                                </Icon>
                                <Text>{data.beds || 0} Beds</Text>
                            </HStack>
                            <HStack gap="2">
                                <Icon color="#d4af37" boxSize="3">
                                    <FaBath />
                                </Icon>
                                <Text>{data.baths || 0} Baths</Text>
                            </HStack>
                            <HStack gap="2">
                                <Icon color="#d4af37" boxSize="3">
                                    <FaRulerCombined />
                                </Icon>
                                <Text>{data.sqft || 'N/A'}</Text>
                            </HStack>
                        </Flex>
                    </Box>
                </Link>
            </Box>
        </motion.div>
    );
};

export default PropertyCard;
