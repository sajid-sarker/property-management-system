import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, Flex, Text, Heading, HStack, Input } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Import reusable components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';
import Button from '../components/common/Button';
import PropertyCard from '../components/properties/PropertyCard';

/**
 * Properties Page
 * Displays all property listings with filtering
 * Uses reusable components: Navbar, Footer, Button, PropertyCard
 */
const Properties = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const showMyListings = searchParams.get('myListings') === 'true';
    
    const [properties, setProperties] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed redundant filterType - now using listingType for both UI and API

    // New Filter State
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [location, setLocation] = useState('');
    const [minRating, setMinRating] = useState('');
    const [status, setStatus] = useState(''); // Default to showing all statuses
    const [listingType, setListingType] = useState(''); // Sale or Rent filter
    const [boostedOnly, setBoostedOnly] = useState(false); // Filter for boosted properties only

    const fetchProperties = async () => {
        try {
            setLoading(true);
            
            // If showing my listings, use the dedicated endpoint
            if (showMyListings && user) {
                const response = await propertyService.getMyListings();
                const data = response.data?.data || response.data || [];
                setProperties(Array.isArray(data) ? data : []);
            } else {
                // Fetch all properties with filters
                const params = {};
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (location) params.location = location;
                if (minRating) params.minRating = minRating;
                if (status) params.status = status;
                if (listingType) params.listingType = listingType;

                const response = await propertyService.getAll(params);

                // Handle both { success: true, data: [...] } and direct array responses
                const data = response.data?.data || response.data || [];
                setProperties(Array.isArray(data) ? data : []);
            }
        } catch (error) {
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
    }, [showMyListings, user, listingType]); // Re-fetch when listing type changes (filter buttons)

    const handleApplyFilters = () => {
        fetchProperties();
    };

    // Client-side filtering
    // - For My Properties: filter by listingType (backend doesn't support it for getMyListings)
    // - For all views: filter by boosted status
    const filteredProperties = properties.filter((p) => {
        // Filter by listing type if a filter is selected
        if (listingType) {
            const propListingType = (p.listingType || '').toLowerCase();
            if (propListingType !== listingType.toLowerCase()) return false;
        }
        
        // Filter by boosted status
        if (boostedOnly && (p.priority || 1) <= 1) return false;
        
        return true;
    });

    return (
       <Box display="flex" bg="#0a0a0f" minH="100vh">
            {/* Sidebar Navigation - Only show for owner's dashboard */}
            <Navbar variant="fixed"/>
            {showMyListings && <Sidebar />}

            {/* Main Content */}
            <Box flex="1" px="8" pb="8" pt="100px" color="white" overflowY="auto">
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
                            {showMyListings ? (
                                <>My <Text as="span" color="#d4af37">Properties</Text></>
                            ) : (
                                <>Exclusive <Text as="span" color="#d4af37">Collection</Text></>
                            )}
                        </Heading>
                        <Text color="#a0a0a0">
                            {showMyListings 
                                ? 'Manage your property listings.' 
                                : 'Discover our handpicked selection of premium properties.'}
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
                            active={listingType === ''}
                            onClick={() => setListingType('')}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            active={listingType === 'sell'}
                            onClick={() => setListingType('sell')}
                        >
                            For Sale
                        </FilterButton>
                        <FilterButton
                            active={listingType === 'rent'}
                            onClick={() => setListingType('rent')}
                        >
                            For Rent
                        </FilterButton>
                    </HStack>
                </Flex>

                {/* Advanced Filters Section */}
                <Box mb="10" bg="#14141f" p="6" borderRadius="xl" border="1px solid rgba(255, 255, 255, 0.05)">
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap="4" alignItems="end">
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Location</Text>
                            <Input
                                placeholder="City, State, or Street"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="none"
                                color="white"
                                pl="4"
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
                                pl="4"
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
                                pl="4"
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
                                bg="#0a0a0f"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                color="white"
                                p="2"
                                pl="4"
                                borderRadius="md"
                                width="100%"
                                cursor="pointer"
                                sx={{
                                    '> option': {
                                        background: '#0a0a0f',
                                        color: 'white',
                                        padding: '10px'
                                    }
                                }}
                                _focus={{ boxShadow: '0 0 0 1px #d4af37', outline: "none" }}
                            >
                                <option value="" style={{ background: '#0a0a0f', color: 'white' }}>Any Rating</option>
                                <option value="1" style={{ background: '#0a0a0f', color: 'white' }}>1+ Stars</option>
                                <option value="2" style={{ background: '#0a0a0f', color: 'white' }}>2+ Stars</option>
                                <option value="3" style={{ background: '#0a0a0f', color: 'white' }}>3+ Stars</option>
                                <option value="4" style={{ background: '#0a0a0f', color: 'white' }}>4+ Stars</option>
                                <option value="5" style={{ background: '#0a0a0f', color: 'white' }}>5 Stars</option>
                            </Box>
                        </Box>
                        <Box>
                            <Text mb="2" fontSize="sm" color="#a0a0a0">Status</Text>
                            <Box
                                as="select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                bg="#0a0a0f"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                color="white"
                                p="2"
                                pl="4"
                                borderRadius="md"
                                width="100%"
                                cursor="pointer"
                                sx={{
                                    '> option': {
                                        background: '#0a0a0f',
                                        color: 'white',
                                        padding: '10px'
                                    }
                                }}
                                _focus={{ boxShadow: '0 0 0 1px #d4af37', outline: "none" }}
                            >

                                <option value="available" style={{ background: '#0a0a0f', color: 'white' }}>Available</option>
                                <option value="unavailable" style={{ background: '#0a0a0f', color: 'white' }}>Unavailable</option>
                            </Box>
                        </Box>
                        {/* Boosted Toggle - Only show for property owners viewing their own listings */}
                        {showMyListings && (
                            <Box>
                                <Text mb="2" fontSize="sm" color="#a0a0a0">Boosted</Text>
                                <Box
                                    as="button"
                                    onClick={() => setBoostedOnly(!boostedOnly)}
                                    display="flex"
                                    alignItems="center"
                                    gap="3"
                                    bg={boostedOnly ? "rgba(212, 175, 55, 0.15)" : "#0a0a0f"}
                                    border={boostedOnly ? "1px solid #d4af37" : "1px solid rgba(255, 255, 255, 0.1)"}
                                    color={boostedOnly ? "#d4af37" : "white"}
                                    p="2"
                                    pl="4"
                                    borderRadius="md"
                                    width="100%"
                                    cursor="pointer"
                                    transition="all 0.2s ease"
                                    _hover={{ borderColor: '#d4af37' }}
                                >
                                    <Box
                                        w="36px"
                                        h="20px"
                                        bg={boostedOnly ? "#d4af37" : "rgba(255, 255, 255, 0.2)"}
                                        borderRadius="full"
                                        position="relative"
                                        transition="all 0.2s ease"
                                    >
                                        <Box
                                            position="absolute"
                                            top="2px"
                                            left={boostedOnly ? "18px" : "2px"}
                                            w="16px"
                                            h="16px"
                                            bg={boostedOnly ? "#0a0a0f" : "white"}
                                            borderRadius="full"
                                            transition="all 0.2s ease"
                                        />
                                    </Box>
                                    <Text fontSize="sm">{boostedOnly ? "On" : "Off"}</Text>
                                </Box>
                            </Box>
                        )}
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
