import React, { useState, useEffect } from 'react';
import { Box, Grid, Flex, Text, Heading, HStack, Input } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // Renamed from filter to filterType to avoid confusion

    // New Filter State
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [location, setLocation] = useState('');
    const [minRating, setMinRating] = useState('');
    const [status, setStatus] = useState('available'); // Default to 'available' for buyers

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const params = {};
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (location) params.location = location;
            if (minRating) params.minRating = minRating;
            if (status) params.status = status;

            const response = await propertyService.getAll(params);

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

    const isLandlord = user?.role === 'landlord';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
      // Raiyan changes start here
        fetchProperties();
    }, []); // Initial load

    const handleApplyFilters = () => {
        fetchProperties();
    };

    // Filter properties based on selection
    // Client-side filtering for Type (Sale/Rent) as that's often a toggle
    const filteredProperties = properties.filter((p) => {
        const propType = (p.type || '').toLowerCase();
        if (filterType === 'sale') return propType.includes('sale') || p.isForSale;
        if (filterType === 'rent') return propType.includes('rent') || p.isForRent;
        return true;
    });
  // Raiyan changes end here
  
//         const fetchProperties = async () => {
//             try {
//                 const response = await propertyService.getAll();
//                 // Handle both { success: true, data: [...] } and direct array responses
//                 const data = response.data?.data || response.data || [];
//                 setProperties(Array.isArray(data) ? data : []);

//                 // Fetch my listings if user is landlord
//                 if (isLandlord) {
//                     try {
//                         const myResponse = await propertyService.getMyListings();
//                         const myData = myResponse.data?.data || myResponse.data || [];
//                         setMyListings(Array.isArray(myData) ? myData : []);
//                     } catch (err) {
//                         console.error('Failed to fetch my listings', err);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch properties', error);
//                 setProperties([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchProperties();
//     }, [isLandlord]);

//     // Filter properties based on selection
//     const filteredProperties = filter === 'my-listings'
//         ? myListings
//         : properties.filter((p) => {
//             if (filter === 'all') return true;
//             const listingType = p.listingType || (p.isForSale ? 'sell' : 'rent');
//             if (filter === 'sell') return listingType === 'sell';
//             if (filter === 'rent') return listingType === 'rent';
//             return true;
//         });

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

                    {/* Filter Buttons (Type) */}
                    <HStack
                        gap="1"
                        bg="#14141f"
                        p="2"
                        borderRadius="10px"
                        border="1px solid rgba(255, 255, 255, 0.05)"
                        flexWrap="wrap"
                    >
                        <FilterButton
                            active={filterType === 'all'}
                            onClick={() => setFilterType('all')}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            active={filterType === 'sale'}
                            onClick={() => setFilterType('sale')}
//                             active={filter === 'sell'}
//                             onClick={() => setFilter('sell')}
                        >
                            For Sell
                        </FilterButton>
                        <FilterButton
                            active={filterType === 'rent'}
                            onClick={() => setFilterType('rent')}
                        >
                            For Rent
                        </FilterButton>
                        {isLandlord && (
                            <FilterButton
                                active={filter === 'my-listings'}
                                onClick={() => setFilter('my-listings')}
                            >
                                My Listings
                            </FilterButton>
                        )}
                    </HStack>
                </Flex>

                {/* Advanced Filters Section */}
                <Box mb="10" bg="#14141f" p="6" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.05)">
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }} gap="4" alignItems="end">
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Location</Text>
                            <Input
                                placeholder="City, State, or Street"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                _focus={{ boxShadow: '0 0 0 1px #d4af37' }}
                            />
                        </Box>
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Min Price</Text>
                            <Input
                                type="number"
                                placeholder="Min Price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                _focus={{ boxShadow: '0 0 0 1px #d4af37' }}
                            />
                        </Box>
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Max Price</Text>
                            <Input
                                type="number"
                                placeholder="Max Price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                _focus={{ boxShadow: '0 0 0 1px #d4af37' }}
                            />
                        </Box>
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Rating</Text>
                            <Box
                                as="select"
                                placeholder="Any Rating"
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                p="2"
                                borderRadius="md"
                                width="100%"
                                sx={{
                                    '> option': {
                                        background: '#14141f',
                                        color: 'white'
                                    }
                                }}
                                _focus={{ boxShadow: '0 0 0 1px #d4af37', outline: "none" }}
                            >
                                <option value="">Any Rating</option>
                                <option value="1">1+ Stars</option>
                                <option value="2">2+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="5">5 Stars</option>
                            </Box>
                        </Box>
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Status</Text>
                            <Box
                                as="select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                p="2"
                                borderRadius="md"
                                width="100%"
                                sx={{
                                    '> option': {
                                        background: '#14141f',
                                        color: 'white'
                                    }
                                }}
                                _focus={{ boxShadow: '0 0 0 1px #d4af37', outline: "none" }}
                            >
                                <option value="available">Available</option>
                                <option value="sold">Sold</option>
                                <option value="rented">Rented</option>
                                <option value="pending">Pending</option>
                                <option value="all">All Statuses</option>
                            </Box>
                        </Box>
                        <Box>
                            <Button
                                variant="primary"
                                onClick={handleApplyFilters}
                                width="100%"
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </Grid>
                </Box>

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
