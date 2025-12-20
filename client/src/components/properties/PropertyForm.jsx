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
import { FaRocket } from 'react-icons/fa';
import Button from '../common/Button';

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
        image: initialData.image || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.image) {
            alert("Please upload a property image");
            return;
        }
        onSubmit(formData);
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
                        {...inputStyles}
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


                {/* Image Upload */}
                <GridItem>
                    <Text {...labelStyles}>Property Image</Text>
                    <Box
                        border="1px dashed rgba(255, 255, 255, 0.1)"
                        borderRadius="8px"
                        p="4"
                        textAlign="center"
                        cursor="pointer"
                        _hover={{ borderColor: '#d4af37' }}
                        position="relative"
                    >
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('image', file);

                                try {
                                    // You might want to move this fetch to an api service method
                                    const res = await fetch('http://localhost:5000/api/upload', {
                                        method: 'POST',
                                        body: formData,
                                    });
                                    const data = await res.json();
                                    
                                    if (data.success) {
                                        // Update form data with the full URL or relative path depending on your requirement
                                        // If backend returns relative path, prepend base URL if needed or store as is
                                        // Here we assume backend returns relative path /uploads/...
                                        // And we'll store the full URL for display if needed, or just path.
                                        // The Property model expects an array of strings for images.
                                        // But the form state seems to handle 'image' as a single string initially based on the code I viewed.
                                        // Let's check how 'image' is used.
                                        // initialData.image || '' in useState.
                                        
                                        // Let's prepend generic localhost for now if it's a relative path, or just use what backend sends
                                        // The backend sends `/uploads/filename`
                                        const imageUrl = `http://localhost:5000${data.data}`;
                                        
                                        // For now, setting it as string. 
                                        // NOTE: The previous code had "Image URL" input mapping to formData.image.
                                        // If the API expects an array, I should probably handle that in submit or here.
                                        // The existing handleSubmit just calls onSubmit(formData).
                                        // I will match the existing behavior: formData.image holds the string URL.
                                        setFormData((prev) => ({ ...prev, image: imageUrl }));
                                    } else {
                                        alert('Upload failed');
                                    }
                                } catch (error) {
                                    console.error('Upload error:', error);
                                    alert('Upload error');
                                }
                            }}
                            opacity="0"
                            position="absolute"
                            top="0"
                            left="0"
                            width="100%"
                            height="100%"
                            cursor="pointer"
                        />
                        {formData.image ? (
                            <Box mt="2" position="relative">
                                {/* Preview the uploaded image */}
                                <img 
                                    src={formData.image} 
                                    alt="Property" 
                                    style={{ 
                                        maxHeight: '150px', 
                                        margin: '0 auto', 
                                        borderRadius: '4px',
                                        objectFit: 'cover'
                                    }} 
                                />
                                <Text fontSize="xs" color="green.400" mt="2">Image Uploaded!</Text>
                            </Box>
                        ) : (
                            <VStack spacing="2" py="6">
                                <Icon as={FaRocket} boxSize="8" color="#6a6a6a" />
                                <Text color="#a0a0a0" fontSize="sm">
                                    Click or Drag to Upload Image
                                </Text>
                            </VStack>
                        )}
                    </Box>
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
