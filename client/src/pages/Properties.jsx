import React, { useState, useEffect } from 'react';
import { Box, Grid, Flex, Text, Heading, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyService } from '../services/api';

// Import reusable components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import PropertyCard from '../components/properties/PropertyCard';

/**
 * Properties Page
 * Displays all property listings with filtering
 * Uses reusable components: Navbar, Footer, Button, PropertyCard
 */
const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await propertyService.getAll();
                // Handle both { success: true, data: [...] } and direct array responses
                const data = response.data?.data || response.data || [];
                setProperties(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch properties', error);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Filter properties based on selection
    const filteredProperties = properties.filter((p) => {
        if (filter === 'all') return true;
        const propType = (p.type || '').toLowerCase();
        if (filter === 'sale') return propType.includes('sale') || p.isForSale;
        if (filter === 'rent') return propType.includes('rent') || p.isForRent;
        return true;
    });

    return (
        <Box bg="#0a0a0f" minH="100vh" color="white">
            {/* Reusable Navbar Component */}
            <Navbar variant="solid" />

            {/* Main Content */}
            <Box className="container" pt="32" pb="16" px="6" maxW="1400px" mx="auto">
                {/* Page Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    mb="12"
                    flexWrap="wrap"
                    gap="8"
                >
                    <Box>
                        <Heading
                            fontFamily="'Playfair Display', serif"
                            fontSize={{ base: '2rem', md: '3rem' }}
                            fontWeight="600"
                            mb="2"
                        >
                            Exclusive <Text as="span" color="#d4af37">Collection</Text>
                        </Heading>
                        <Text color="#a0a0a0">
                            Discover our handpicked selection of premium properties.
                        </Text>
                    </Box>

                    {/* Filter Buttons */}
                    <HStack
                        gap="1"
                        bg="#14141f"
                        p="2"
                        borderRadius="10px"
                        border="1px solid rgba(255, 255, 255, 0.05)"
                    >
                        <FilterButton
                            active={filter === 'all'}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            active={filter === 'sale'}
                            onClick={() => setFilter('sale')}
                        >
                            For Sale
                        </FilterButton>
                        <FilterButton
                            active={filter === 'rent'}
                            onClick={() => setFilter('rent')}
                        >
                            For Rent
                        </FilterButton>
                    </HStack>
                </Flex>

                {/* Property Grid */}
                {loading ? (
                    <Box textAlign="center" py="16">
                        <Text color="#a0a0a0" fontSize="lg">Loading properties...</Text>
                    </Box>
                ) : filteredProperties.length === 0 ? (
                    <Box textAlign="center" py="16">
                        <Text color="#a0a0a0" fontSize="lg">No properties found.</Text>
                    </Box>
                ) : (
                    <motion.div layout>
                        <Grid
                            templateColumns={{
                                base: '1fr',
                                md: 'repeat(2, 1fr)',
                                lg: 'repeat(3, 1fr)',
                            }}
                            gap="8"
                        >
                            <AnimatePresence>
                                {filteredProperties.map((prop, index) => (
                                    <PropertyCard
                                        key={prop._id || prop.propertyId || prop.id}
                                        data={prop}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </Grid>
                    </motion.div>
                )}
            </Box>

            {/* Reusable Footer Component */}
            <Footer />
        </Box>
    );
};

/**
 * FilterButton - Local helper component for filter buttons
 */
const FilterButton = ({ active, onClick, children }) => (
    <Box
        as="button"
        onClick={onClick}
        px="4"
        py="2"
        borderRadius="6px"
        fontWeight="600"
        fontSize="0.9rem"
        transition="all 0.2s ease"
        bg={active ? '#d4af37' : 'transparent'}
        color={active ? '#0a0a0f' : '#a0a0a0'}
        _hover={{
            bg: active ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
            color: active ? '#0a0a0f' : 'white',
        }}
    >
        {children}
    </Box>
);

export default Properties;
