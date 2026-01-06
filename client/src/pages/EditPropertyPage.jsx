import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Icon } from '@chakra-ui/react';
import { FaCloudUploadAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import { propertyService, uploadService } from '../services/api';
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
        images: [],
        startingPrice: '',
        price: '',
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

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
                    images: propertyData.images || [],
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
                images: formData.images,
                image: formData.images[0] || '',
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
            if (err.response?.status === 413) {
                alert('Images are too large. Please reduce image size or count.');
            } else {
                alert(err.response?.data?.message || 'Failed to update property');
            }
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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            setUploadError('Image must be less than 1MB');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const response = await uploadService.uploadImage(file);
            const imageData = response.data?.data || response.data;
            setFormData((prev) => ({ ...prev, images: [...prev.images, imageData] }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
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
                        {/* Property Images Section */}
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Text {...labelStyles}>Property Images</Text>
                            
                            {/* Display Current Images */}
                            {formData.images.length > 0 && (
                                <Box
                                    display="grid"
                                    gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))"
                                    gap="4"
                                    mb="4"
                                >
                                    {formData.images.map((img, index) => (
                                        <Box key={index} position="relative" borderRadius="8px" overflow="hidden">
                                            <img
                                                src={img}
                                                alt={`Property ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/200x120/14141f/d4af37?text=Error';
                                                }}
                                            />
                                            <Box
                                                as="button"
                                                type="button"
                                                position="absolute"
                                                top="4px"
                                                right="4px"
                                                bg="rgba(255, 100, 100, 0.9)"
                                                color="white"
                                                p="1"
                                                borderRadius="full"
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                _hover={{ bg: '#ff4444' }}
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <Icon as={FaTimes} boxSize="3" />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Upload Button */}
                            <Box
                                as="label"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                p="6"
                                borderRadius="12px"
                                border="2px dashed"
                                borderColor={formData.images.length > 0 ? '#d4af37' : 'rgba(255, 255, 255, 0.2)'}
                                bg={formData.images.length > 0 ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0.3)'}
                                cursor="pointer"
                                transition="all 0.2s ease"
                                _hover={{
                                    borderColor: '#d4af37',
                                    bg: 'rgba(212, 175, 55, 0.1)',
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {uploading ? (
                                    <VStack gap="2">
                                        <Icon as={FaSpinner} color="#d4af37" boxSize="8" className="spin" />
                                        <Text color="#a0a0a0">Uploading...</Text>
                                    </VStack>
                                ) : (
                                    <VStack gap="2">
                                        <Icon as={FaCloudUploadAlt} color="#d4af37" boxSize="10" />
                                        <Text color="white" fontWeight="600">
                                            {formData.images.length > 0 ? 'Add another image' : 'Click to upload image'}
                                        </Text>
                                        <Text color="#a0a0a0" fontSize="sm">PNG, JPG up to 1MB each</Text>
                                    </VStack>
                                )}
                            </Box>
                            {uploadError && (
                                <Text color="#f87171" fontSize="sm" mt="2">
                                    {uploadError}
                                </Text>
                            )}
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
