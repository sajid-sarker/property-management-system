import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Grid,
    GridItem,
    Input,
    Textarea,
    Icon,
} from '@chakra-ui/react';
import { FaRocket, FaCloudUploadAlt, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import Button from '../common/Button';
import { uploadService } from '../../services/api';

/**
 * Reusable PropertyForm Component
 * Used for creating and editing property listings
 */
const PropertyForm = ({
    initialData = {},
    onSubmit,
    isLoading = false,
    showBoostOption = true,
    onBoostChange,
    wantsBoost = false,
}) => {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        location: initialData.location || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'Bangladesh',
        price: initialData.price || '',
        type: initialData.type || 'house',
        beds: initialData.beds || '',
        baths: initialData.baths || '',
        sqft: initialData.sqft || '',
        description: initialData.description || '',
        images: initialData.images || [],
        // New fields for sell/rent
        listingType: initialData.listingType || 'rent',
        startingPrice: initialData.startingPrice || '',
        isBiddable: initialData.isBiddable || false,
    });

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        // Validate file size (max 1MB)
        if (file.size > 1 * 1024 * 1024) {
            setUploadError('Image must be less than 1MB');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const response = await uploadService.uploadImage(file);
            const imageData = response.data?.data || response.data;
            
            // Append new image to images array
            setFormData((prev) => ({ ...prev, images: [...prev.images, imageData] }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
        // Reset file input so same file can be uploaded again
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Include first image as 'image' for backward compatibility
        const submitData = {
            ...formData,
            image: formData.images[0] || ''
        };
        onSubmit(submitData);
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

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            background="#14141f"
            p="8"
            borderRadius="16px"
            border="1px solid rgba(212, 175, 55, 0.2)"
        >
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="6">
                {/* Property Title - Full Width */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Property Title</Text>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Midnight Villa"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Listing Type - For Sell / For Rent Radio */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Listing Type</Text>
                    <HStack gap="6" mt="2">
                        <Box
                            as="label"
                            display="flex"
                            alignItems="center"
                            gap="3"
                            cursor="pointer"
                            p="4"
                            borderRadius="8px"
                            bg={formData.listingType === 'rent' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.3)'}
                            border={formData.listingType === 'rent' ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)'}
                            transition="all 0.2s ease"
                            flex="1"
                            _hover={{ borderColor: '#d4af37' }}
                        >
                            <Box
                                as="input"
                                type="radio"
                                name="listingType"
                                value="rent"
                                checked={formData.listingType === 'rent'}
                                onChange={handleChange}
                                accentColor="#d4af37"
                                width="18px"
                                height="18px"
                            />
                            <Box>
                                <Text color="white" fontWeight="600">For Rent</Text>
                                <Text color="#a0a0a0" fontSize="sm">Monthly rental listing</Text>
                            </Box>
                        </Box>
                        <Box
                            as="label"
                            display="flex"
                            alignItems="center"
                            gap="3"
                            cursor="pointer"
                            p="4"
                            borderRadius="8px"
                            bg={formData.listingType === 'sell' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.3)'}
                            border={formData.listingType === 'sell' ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)'}
                            transition="all 0.2s ease"
                            flex="1"
                            _hover={{ borderColor: '#d4af37' }}
                        >
                            <Box
                                as="input"
                                type="radio"
                                name="listingType"
                                value="sell"
                                checked={formData.listingType === 'sell'}
                                onChange={handleChange}
                                accentColor="#d4af37"
                                width="18px"
                                height="18px"
                            />
                            <Box>
                                <Text color="white" fontWeight="600">For Sell</Text>
                                <Text color="#a0a0a0" fontSize="sm">Property for sale</Text>
                            </Box>
                        </Box>
                    </HStack>
                </GridItem>

                {/* Conditional: Starting Price & Biddable (For Sell only) */}
                {formData.listingType === 'sell' && (
                    <>
                        <GridItem>
                            <Text {...labelStyles}>Starting Price *</Text>
                            <Input
                                name="startingPrice"
                                type="number"
                                value={formData.startingPrice}
                                onChange={handleChange}
                                placeholder="e.g. 5000000"
                                required
                                {...inputStyles}
                            />
                        </GridItem>
                        <GridItem>
                            <Text {...labelStyles}>Accept Bids?</Text>
                            <Box
                                as="label"
                                display="flex"
                                alignItems="center"
                                gap="3"
                                cursor="pointer"
                                p="4"
                                borderRadius="8px"
                                bg={formData.isBiddable ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0, 0, 0, 0.3)'}
                                border={formData.isBiddable ? '2px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)'}
                                transition="all 0.2s ease"
                                _hover={{ borderColor: '#d4af37' }}
                            >
                                <Box
                                    as="input"
                                    type="checkbox"
                                    name="isBiddable"
                                    checked={formData.isBiddable}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isBiddable: e.target.checked }))}
                                    accentColor="#d4af37"
                                    width="18px"
                                    height="18px"
                                />
                                <Box>
                                    <Text color="white" fontWeight="600">Enable Bidding</Text>
                                    <Text color="#a0a0a0" fontSize="sm">Allow buyers to place bids</Text>
                                </Box>
                            </Box>
                        </GridItem>
                    </>
                )}

                {/* Street Address - Full Width */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Street Address</Text>
                    <Input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. 123 Gulshan Avenue"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* City */}
                <GridItem>
                    <Text {...labelStyles}>City</Text>
                    <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Dhaka"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* State/Division */}
                <GridItem>
                    <Text {...labelStyles}>State/Division</Text>
                    <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Dhaka Division"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Country */}
                <GridItem>
                    <Text {...labelStyles}>Country</Text>
                    <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="e.g. Bangladesh"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Price */}
                <GridItem>
                    <Text {...labelStyles}>Price</Text>
                    <Input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="e.g. 5000000"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Type */}
                <GridItem>
                    <Text {...labelStyles}>Type</Text>
                    <Box
                        as="select"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        width="100%"
                        bg="rgba(0, 0, 0, 0.3)"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                        borderRadius="8px"
                        color="white"
                        p="2.5"
                        _focus={{
                            borderColor: '#d4af37',
                            boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
                            outline: 'none',
                        }}
                        sx={{
                            '& option': {
                                background: '#14141f',
                                color: 'white',
                            },
                        }}
                    >
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                    </Box>
                </GridItem>

                {/* Bedrooms */}
                <GridItem>
                    <Text {...labelStyles}>Bedrooms</Text>
                    <Input
                        name="beds"
                        type="number"
                        value={formData.beds}
                        onChange={handleChange}
                        placeholder="e.g. 4"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Bathrooms */}
                <GridItem>
                    <Text {...labelStyles}>Bathrooms</Text>
                    <Input
                        name="baths"
                        type="number"
                        value={formData.baths}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Square Footage */}
                <GridItem>
                    <Text {...labelStyles}>Square Footage</Text>
                    <Input
                        name="sqft"
                        value={formData.sqft}
                        onChange={handleChange}
                        placeholder="e.g. 5,000 sqft"
                        required
                        {...inputStyles}
                    />
                </GridItem>


                {/* Image Upload Section */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Property Images</Text>
                    
                    {/* Display Uploaded Images */}
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

                {/* Description - Full Width */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Description</Text>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the luxury features..."
                        rows={4}
                        {...inputStyles}
                    />
                </GridItem>
            </Grid>

            {/* Boost Property Option */}
            {showBoostOption && (
                <Box
                    mt="6"
                    p="5"
                    borderRadius="12px"
                    background={wantsBoost ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.08)'}
                    border={wantsBoost ? '2px solid #d4af37' : '1px solid rgba(212, 175, 55, 0.3)'}
                    cursor="pointer"
                    transition="all 0.3s ease"
                    onClick={() => onBoostChange && onBoostChange(!wantsBoost)}
                    _hover={{
                        borderColor: '#d4af37',
                    }}
                >
                    <HStack justify="space-between">
                        <HStack gap="4">
                            <Box
                                p="3"
                                borderRadius="10px"
                                background="rgba(212, 175, 55, 0.2)"
                            >
                                <Icon color="#d4af37" boxSize="5">
                                    <FaRocket />
                                </Icon>
                            </Box>
                            <Box>
                                <Text color="#d4af37" fontWeight="600" fontSize="lg">
                                    Boost Property Listing
                                </Text>
                                <Text color="#a0a0a0" fontSize="sm">
                                    Get 3x more views by featuring your property
                                </Text>
                            </Box>
                        </HStack>
                        <HStack gap="3">
                            <Box
                                as="input"
                                type="checkbox"
                                checked={wantsBoost}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onBoostChange && onBoostChange(e.target.checked);
                                }}
                                width="20px"
                                height="20px"
                                accentColor="#d4af37"
                            />
                            <Text color="#d4af37" fontWeight="600">
                                From $29.99
                            </Text>
                        </HStack>
                    </HStack>
                </Box>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                leftIcon={wantsBoost ? <FaRocket /> : undefined}
                style={{ marginTop: '1.5rem', padding: '1rem' }}
            >
                {wantsBoost ? 'Create & Boost Listing' : 'Submit Listing'}
            </Button>
        </Box>
    );
};

export default PropertyForm;
