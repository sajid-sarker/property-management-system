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
import { FaRocket, FaCloudUploadAlt, FaCheck, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';
import { uploadService } from '../../services/api';

/**
 * DevRequestForm Component
 * Form for Landlords to submit development requests
 */
const DevRequestForm = ({
    onSubmit,
    isLoading = false,
    showBoostOption = true,
    onBoostChange,
    wantsBoost = false,
}) => {
    const [formData, setFormData] = useState({
        address: '',
        landArea: '',
        description: '',
        image: '',
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
            const imagePath = response.data?.data || response.data;
            const imageUrl = `http://localhost:5000${imagePath}`;
            setFormData((prev) => ({ ...prev, image: imageUrl }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                {/* Address - Full Width */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Property Address *</Text>
                    <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. 123 Gulshan Avenue, Dhaka"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Land Area */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Land Area *</Text>
                    <Input
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleChange}
                        placeholder="e.g. 5,000 sqft or 10 Katha"
                        required
                        {...inputStyles}
                    />
                </GridItem>

                {/* Image Upload Input */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Property Image</Text>
                    <Box
                        as="label"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p="6"
                        borderRadius="12px"
                        border="2px dashed"
                        borderColor={formData.image ? '#d4af37' : 'rgba(255, 255, 255, 0.2)'}
                        bg={formData.image ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0.3)'}
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
                        ) : formData.image ? (
                            <VStack gap="2">
                                <Icon as={FaCheck} color="#4ade80" boxSize="8" />
                                <Text color="#4ade80" fontWeight="600">Image Uploaded</Text>
                                <Text color="#a0a0a0" fontSize="sm">Click to change</Text>
                            </VStack>
                        ) : (
                            <VStack gap="2">
                                <Icon as={FaCloudUploadAlt} color="#d4af37" boxSize="10" />
                                <Text color="white" fontWeight="600">Click to upload image</Text>
                                <Text color="#a0a0a0" fontSize="sm">PNG, JPG up to 1MB</Text>
                            </VStack>
                        )}
                    </Box>
                    {uploadError && (
                        <Text color="#f87171" fontSize="sm" mt="2">
                            {uploadError}
                        </Text>
                    )}
                    {formData.image && (
                        <Box mt="4" position="relative">
                            <img
                                src={formData.image}
                                alt="Property Preview"
                                style={{
                                    maxHeight: '200px',
                                    width: '100%',
                                    borderRadius: '8px',
                                    objectFit: 'cover',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/800x400/14141f/d4af37?text=Image+Preview';
                                }}
                            />
                        </Box>
                    )}
                </GridItem>

                {/* Description - Full Width */}
                <GridItem colSpan={{ base: 1, md: 2 }}>
                    <Text {...labelStyles}>Development Description *</Text>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the development requirements, goals, and any specific needs..."
                        rows={5}
                        required
                        {...inputStyles}
                    />
                </GridItem>
            </Grid>

            {/* Boost Development Request Option */}
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
                                    Boost Development Request
                                </Text>
                                <Text color="#a0a0a0" fontSize="sm">
                                    Get 3x more visibility from development companies
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
                {wantsBoost ? 'Submit & Boost Request' : 'Submit Development Request'}
            </Button>
        </Box>
    );
};

export default DevRequestForm;
