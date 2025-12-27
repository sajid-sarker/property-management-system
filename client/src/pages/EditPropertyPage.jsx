import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem } from '@chakra-ui/react';
import { propertyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Import reusable components
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

/**
 * EditPropertyPage - Allows landlords to edit their property listing
 * Features: Update images, update starting price, delete listing
 */
const EditPropertyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        image: '',
        startingPrice: '',
        price: '',
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await propertyService.getById(id);
                const propertyData = response.data?.data || response.data;

                if (!propertyData) {
                    setError('Property not found');
                    return;
                }

                // Check ownership
                const landlordId = propertyData.landlord?._id || propertyData.landlord;
                const userId = user?._id || user?.userId || user?.id;

                if (landlordId?.toString() !== userId?.toString()) {
                    setError('You are not authorized to edit this property');
                    return;
                }

                setProperty(propertyData);
                setFormData({
                    image: propertyData.image || (propertyData.images && propertyData.images[0]) || '',
                    startingPrice: propertyData.startingPrice || '',
                    price: propertyData.price || '',
                });
            } catch (err) {
                console.error('Failed to fetch property:', err);
                setError('Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProperty();
        }
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                images: formData.image ? [formData.image] : undefined,
                image: formData.image || undefined,
            };

            // Add price fields based on listing type
            if (property.listingType === 'sell' && formData.startingPrice) {
                updateData.startingPrice = parseInt(formData.startingPrice);
            } else if (property.listingType === 'rent' && formData.price) {
                updateData.price = parseInt(formData.price);
            }

            await propertyService.update(id, updateData);
            alert('Property updated successfully!');
            navigate(`/property/${id}`);
        } catch (err) {
            console.error('Failed to update property:', err);
            alert(err.response?.data?.message || 'Failed to update property');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await propertyService.deleteProperty(id);
            alert('Property deleted successfully');
            navigate('/properties');
        } catch (err) {
            console.error('Failed to delete property:', err);
            alert(err.response?.data?.message || 'Failed to delete property');
        } finally {
            setDeleting(false);
        }
    };

    const inputStyles = {
        bg: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: 'white',
        p: '4',
        _focus: {
            borderColor: '#d4af37',
            boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
        },
        _placeholder: { color: '#6a6a6a' },
    };

    const labelStyles = {
        color: '#a0a0a0',
        fontSize: 'sm',
        mb: '2',
        display: 'block',
    };

    if (loading) {
        return (
            <Box bg="#0a0a0f" minH="100vh" color="white">
                <Navbar variant="solid" />
                <Box maxW="800px" mx="auto" px="6" pt="32" pb="16" textAlign="center">
                    <Text color="#a0a0a0">Loading property...</Text>
                </Box>
                <Footer />
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg="#0a0a0f" minH="100vh" color="white">
                <Navbar variant="solid" />
                <Box maxW="800px" mx="auto" px="6" pt="32" pb="16" textAlign="center">
                    <Text color="#ff6b6b" fontSize="xl">{error}</Text>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/properties')}
                        style={{ marginTop: '2rem' }}
                    >
                        Back to Properties
                    </Button>
                </Box>
                <Footer />
            </Box>
        );
    }

    return (
        <Box bg="#0a0a0f" minH="100vh" color="white">
            <Navbar variant="solid" />

            <Box maxW="800px" mx="auto" px="6" pt="32" pb="16">
                {/* Page Header */}
                <VStack mb="10" textAlign="center">
                    <Heading
                        fontFamily="'Playfair Display', serif"
                        fontSize={{ base: '2rem', md: '2.5rem' }}
                        fontWeight="600"
                    >
                        Edit <Text as="span" color="#d4af37">Listing</Text>
                    </Heading>
                    <Text color="#a0a0a0" fontSize="lg">
                        {property.title}
                    </Text>
                </VStack>

                {/* Edit Form */}
                <Box
                    background="#14141f"
                    p="8"
                    borderRadius="16px"
                    border="1px solid rgba(212, 175, 55, 0.2)"
                >
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="6">
                        {/* Current Image Preview */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Text {...labelStyles}>Current Image</Text>
                            {formData.image && (
                                <Box mb="4" borderRadius="8px" overflow="hidden">
                                    <img
                                        src={formData.image}
                                        alt="Property"
                                        style={{
                                            maxHeight: '200px',
                                            width: '100%',
                                            objectFit: 'cover',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/800x400/14141f/d4af37?text=Invalid+Image+URL';
                                        }}
                                    />
                                </Box>
                            )}
                        </GridItem>

                        {/* Image URL */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Text {...labelStyles}>Property Image URL</Text>
                            <Input
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://images.unsplash.com/..."
                                {...inputStyles}
                            />
                        </GridItem>

                        {/* Price Fields based on listing type */}
                        {property.listingType === 'sell' ? (
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <Text {...labelStyles}>Starting Price</Text>
                                <Input
                                    name="startingPrice"
                                    type="number"
                                    value={formData.startingPrice}
                                    onChange={handleChange}
                                    placeholder="e.g. 5000000"
                                    {...inputStyles}
                                />
                                <Text fontSize="xs" color="#a0a0a0" mt="2">
                                    Current Price: ${property.currentPrice?.toLocaleString() || property.startingPrice?.toLocaleString()}
                                </Text>
                            </GridItem>
                        ) : (
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                                <Text {...labelStyles}>Monthly Rent</Text>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 2500"
                                    {...inputStyles}
                                />
                            </GridItem>
                        )}

                        {/* Property Info (Read-only) */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Box
                                p="4"
                                bg="rgba(0,0,0,0.2)"
                                borderRadius="8px"
                                border="1px solid rgba(255,255,255,0.05)"
                            >
                                <Text color="#a0a0a0" fontSize="sm" mb="2">Property Details (Read-only)</Text>
                                <HStack gap="6" flexWrap="wrap">
                                    <Text color="white">
                                        <Text as="span" color="#d4af37">Type:</Text> {property.type}
                                    </Text>
                                    <Text color="white">
                                        <Text as="span" color="#d4af37">Listing:</Text> {property.listingType === 'sell' ? 'For Sale' : 'For Rent'}
                                    </Text>
                                    <Text color="white">
                                        <Text as="span" color="#d4af37">Status:</Text> {property.status}
                                    </Text>
                                    {property.isBiddable && (
                                        <Text color="#4ade80">Bidding Enabled</Text>
                                    )}
                                </HStack>
                            </Box>
                        </GridItem>
                    </Grid>

                    {/* Action Buttons */}
                    <HStack mt="8" gap="4" justify="space-between" flexWrap="wrap">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/property/${id}`)}
                        >
                            Cancel
                        </Button>

                        <HStack gap="4">
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={saving}
                            >
                                Save Changes
                            </Button>
                        </HStack>
                    </HStack>

                    {/* Delete Section */}
                    <Box
                        mt="8"
                        pt="6"
                        borderTop="1px solid rgba(255, 107, 107, 0.2)"
                    >
                        <Text color="#ff6b6b" fontWeight="600" mb="2">Danger Zone</Text>
                        <Text color="#a0a0a0" fontSize="sm" mb="4">
                            Once deleted, this listing cannot be recovered. All associated bids will also be removed.
                        </Text>
                        <Box
                            as="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            px="6"
                            py="3"
                            bg="transparent"
                            border="1px solid #ff6b6b"
                            borderRadius="8px"
                            color="#ff6b6b"
                            fontWeight="600"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{ bg: 'rgba(255, 107, 107, 0.1)' }}
                            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                        >
                            {deleting ? 'Deleting...' : 'Delete Listing'}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Footer />
        </Box>
    );
};

export default EditPropertyPage;
