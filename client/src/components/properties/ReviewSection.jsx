import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Flex,
    Textarea,
} from '@chakra-ui/react';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { propertyService } from '../../services/api';

/**
 * ReviewSection Component
 * Displays property reviews from previous tenants and allows authenticated users to add reviews
 * Feature 4 of Requirement 3: Show reviews from previous tenants
 * 
 * Props:
 * - propertyId: ID of the property
 * - landlordId: ID of the property owner (to prevent self-reviews)
 * - initialReviews: Array of existing reviews
 * - initialAverageRating: Current average rating
 */
const ReviewSection = ({ propertyId, landlordId, initialReviews = [], initialAverageRating = 0 }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState(initialReviews);
    const [averageRating, setAverageRating] = useState(initialAverageRating);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check if the current user is the property owner
    const isPropertyOwner = user && landlordId && (
        user._id === landlordId || 
        user.id === landlordId ||
        user._id?.toString() === landlordId?.toString()
    );

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle star click for rating
    const handleStarClick = (rating) => {
        setNewRating(rating);
        setError('');
    };

    // Submit new review
    const handleSubmitReview = async () => {
        if (!user) {
            setError('Please log in to submit a review');
            return;
        }
        if (newRating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await propertyService.addReview(propertyId, {
                rating: newRating,
                comment: comment.trim()
            });

            // Handle different response structures
            const data = response?.data;
            if (data?.success || data?.data) {
                const reviewsData = data?.data?.reviews || data?.reviews || [];
                const avgRating = data?.data?.averageRating || data?.averageRating || 0;

                setReviews(reviewsData);
                setAverageRating(avgRating);
                setSuccess(data?.message || 'Review submitted successfully!');
                setNewRating(0);
                setComment('');
            } else {
                setError(data?.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Star Rating Display Component
    const StarRating = ({ rating, size = 16, interactive = false, onHover = () => { }, onClick = () => { } }) => {
        return (
            <HStack gap={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Box
                        key={star}
                        cursor={interactive ? 'pointer' : 'default'}
                        onMouseEnter={() => interactive && onHover(star)}
                        onMouseLeave={() => interactive && onHover(0)}
                        onClick={() => interactive && onClick(star)}
                        transition="transform 0.2s ease"
                        _hover={interactive ? { transform: 'scale(1.2)' } : {}}
                        color={star <= (interactive ? (hoverRating || newRating) : rating) ? '#d4af37' : '#3a3a4a'}
                        fontSize={`${size}px`}
                    >
                        {star <= (interactive ? (hoverRating || newRating) : rating) ? <FaStar /> : <FaRegStar />}
                    </Box>
                ))}
            </HStack>
        );
    };

    return (
        <Box
            mt={8}
            p={6}
            background="linear-gradient(180deg, #14141f 0%, #0a0a0f 100%)"
            borderRadius="16px"
            border="1px solid rgba(255,255,255,0.05)"
        >
            {/* Header with Average Rating */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading
                    size="lg"
                    color="white"
                    fontFamily="'Playfair Display', serif"
                >
                    Tenant Reviews
                </Heading>
                <HStack gap={3}>
                    <Box
                        px={4}
                        py={2}
                        background="rgba(212, 175, 55, 0.15)"
                        borderRadius="12px"
                        border="1px solid rgba(212, 175, 55, 0.3)"
                    >
                        <HStack gap={2}>
                            <Box color="#d4af37" fontSize="20px">
                                <FaStar />
                            </Box>
                            <Text color="#d4af37" fontWeight="700" fontSize="lg">
                                {averageRating || 'N/A'}
                            </Text>
                            <Text color="#a0a0a0" fontSize="sm">
                                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                            </Text>
                        </HStack>
                    </Box>
                </HStack>
            </Flex>

            {/* Reviews List */}
            <VStack gap={4} align="stretch" mb={8}>
                {reviews.length === 0 ? (
                    <Box
                        p={6}
                        textAlign="center"
                        background="rgba(255,255,255,0.02)"
                        borderRadius="12px"
                        border="1px dashed rgba(255,255,255,0.1)"
                    >
                        <Text color="#a0a0a0" fontSize="md">
                            No reviews yet. Be the first to share your experience!
                        </Text>
                    </Box>
                ) : (
                    reviews.map((review, index) => (
                        <Box
                            key={review._id || index}
                            p={5}
                            background="rgba(255,255,255,0.02)"
                            borderRadius="12px"
                            border="1px solid rgba(255,255,255,0.05)"
                            transition="all 0.2s ease"
                            _hover={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                            <Flex justify="space-between" align="flex-start" mb={3}>
                                <HStack gap={3}>
                                    <Box
                                        width="32px"
                                        height="32px"
                                        borderRadius="full"
                                        bg="#d4af37"
                                        color="#0a0a0f"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontSize="18px"
                                    >
                                        <FaUserCircle />
                                    </Box>
                                    <Box>
                                        <Text color="white" fontWeight="600" fontSize="sm">
                                            {review.user?.name || 'Anonymous Tenant'}
                                        </Text>
                                        <Text color="#6a6a7a" fontSize="xs">
                                            {formatDate(review.createdAt)}
                                        </Text>
                                    </Box>
                                </HStack>
                                <StarRating rating={review.rating} size={14} />
                            </Flex>
                            {review.comment && (
                                <Text color="#a0a0a0" fontSize="sm" lineHeight="1.7" pl={10}>
                                    "{review.comment}"
                                </Text>
                            )}
                        </Box>
                    ))
                )}
            </VStack>

            {/* Add Review Section */}
            <Box
                p={5}
                background="linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%)"
                borderRadius="12px"
                border="1px solid rgba(212, 175, 55, 0.2)"
            >
                <Heading
                    size="sm"
                    color="white"
                    fontFamily="'Playfair Display', serif"
                    mb={4}
                >
                    {isPropertyOwner 
                        ? 'Property Owner' 
                        : user 
                            ? 'Share Your Experience' 
                            : 'Log in to Write a Review'}
                </Heading>

                {isPropertyOwner ? (
                    <Box textAlign="center" py={4}>
                        <Text color="#a0a0a0" fontSize="sm">
                            You cannot review your own property.
                        </Text>
                    </Box>
                ) : user ? (
                    <VStack gap={4} align="stretch">
                        {/* Star Rating Input */}
                        <Box>
                            <Text color="#a0a0a0" fontSize="sm" mb={2}>
                                Your Rating
                            </Text>
                            <StarRating
                                rating={newRating}
                                size={28}
                                interactive={true}
                                onHover={setHoverRating}
                                onClick={handleStarClick}
                            />
                        </Box>

                        {/* Comment Input */}
                        <Box>
                            <Text color="#a0a0a0" fontSize="sm" mb={2}>
                                Your Review (optional)
                            </Text>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share details about your stay..."
                                background="rgba(0,0,0,0.3)"
                                border="1px solid rgba(255,255,255,0.1)"
                                borderRadius="8px"
                                color="white"
                                fontSize="sm"
                                rows={3}
                                _focus={{
                                    borderColor: '#d4af37',
                                    boxShadow: '0 0 0 1px #d4af37',
                                }}
                                _placeholder={{ color: '#5a5a6a' }}
                            />
                        </Box>

                        {/* Error/Success Messages */}
                        {error && (
                            <Text color="#f87171" fontSize="sm">
                                {error}
                            </Text>
                        )}
                        {success && (
                            <Text color="#4ade80" fontSize="sm">
                                {success}
                            </Text>
                        )}

                        {/* Submit Button */}
                        <Button
                            variant="primary"
                            onClick={handleSubmitReview}
                            isLoading={isSubmitting}
                            isDisabled={newRating === 0}
                        >
                            Submit Review
                        </Button>
                    </VStack>
                ) : (
                    <Box textAlign="center" py={4}>
                        <Text color="#a0a0a0" fontSize="sm" mb={3}>
                            Please log in to share your review about this property.
                        </Text>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/login'}
                        >
                            Log In
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ReviewSection;
