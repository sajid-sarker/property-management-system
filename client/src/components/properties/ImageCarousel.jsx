import React, { useState } from 'react';
import { Box, HStack, Icon } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * ImageCarousel Component
 * Displays property images one at a time with navigation controls
 */
const ImageCarousel = ({ images = [], title = 'Property' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Ensure images is an array
    const imageArray = Array.isArray(images) ? images : [images].filter(Boolean);

    // If no images, show placeholder
    if (imageArray.length === 0) {
        return (
            <Box
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="#14141f"
            >
                <img
                    src="https://placehold.co/800x600/14141f/d4af37?text=No+Image"
                    alt="No image available"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>
        );
    }

    // Single image - no controls needed
    if (imageArray.length === 1) {
        return (
            <img
                src={imageArray[0]}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/800x600/14141f/d4af37?text=Image+Error';
                }}
            />
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
    };

    const goToIndex = (index) => {
        setCurrentIndex(index);
    };

    return (
        <Box position="relative" width="100%" height="100%">
            {/* Main Image */}
            <img
                src={imageArray[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/800x600/14141f/d4af37?text=Image+Error';
                }}
            />

            {/* Previous Button */}
            <Box
                as="button"
                position="absolute"
                left="1rem"
                top="50%"
                transform="translateY(-50%)"
                bg="rgba(0, 0, 0, 0.6)"
                color="white"
                p="3"
                borderRadius="full"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ bg: 'rgba(212, 175, 55, 0.8)' }}
                onClick={goToPrevious}
                zIndex="10"
            >
                <Icon as={FaChevronLeft} boxSize="5" />
            </Box>

            {/* Next Button */}
            <Box
                as="button"
                position="absolute"
                right="1rem"
                top="50%"
                transform="translateY(-50%)"
                bg="rgba(0, 0, 0, 0.6)"
                color="white"
                p="3"
                borderRadius="full"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ bg: 'rgba(212, 175, 55, 0.8)' }}
                onClick={goToNext}
                zIndex="10"
            >
                <Icon as={FaChevronRight} boxSize="5" />
            </Box>

            {/* Dot Indicators */}
            <HStack
                position="absolute"
                bottom="1rem"
                left="50%"
                transform="translateX(-50%)"
                gap="2"
                zIndex="10"
            >
                {imageArray.map((_, index) => (
                    <Box
                        key={index}
                        as="button"
                        width={currentIndex === index ? '24px' : '10px'}
                        height="10px"
                        borderRadius="full"
                        bg={currentIndex === index ? '#d4af37' : 'rgba(255, 255, 255, 0.5)'}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ bg: currentIndex === index ? '#d4af37' : 'rgba(255, 255, 255, 0.8)' }}
                        onClick={() => goToIndex(index)}
                    />
                ))}
            </HStack>

            {/* Image Counter */}
            <Box
                position="absolute"
                top="1rem"
                right="1rem"
                bg="rgba(0, 0, 0, 0.6)"
                color="white"
                px="3"
                py="1"
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
                zIndex="10"
            >
                {currentIndex + 1} / {imageArray.length}
            </Box>
        </Box>
    );
};

export default ImageCarousel;
