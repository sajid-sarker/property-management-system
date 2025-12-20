import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, HStack, Text, Icon, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaStar } from 'react-icons/fa';

/**
 * Reusable PropertyCard Component
 * Displays property information with boost/featured badge
 */
const PropertyCard = ({ data, index = 0 }) => {
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
                {/* Featured Badge for Boosted Properties */}
                {isBoosted && (
                    <Badge
                        position="absolute"
                        top="0"
                        left="0"
                        zIndex="10"
                        background="linear-gradient(135deg, #d4af37, #c5a028)"
                        color="#0a0a0f"
                        px="4"
                        py="2"
                        borderBottomRightRadius="12px"
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

                <Link to={`/properties/${propertyId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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

                        {/* Type Badge */}
                        <Badge
                            position="absolute"
                            top="4"
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

                        {/* Price Overlay */}
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
