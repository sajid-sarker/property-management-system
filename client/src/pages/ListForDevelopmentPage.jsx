import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { projectService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import DevRequestForm from '../components/properties/DevRequestForm';

/**
 * ListForDevelopmentPage - Page for Landlords to create development requests
 */
const ListForDevelopmentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [wantsBoost, setWantsBoost] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            const landlordId = user?._id || user?.userId || user?.id;

            if (!landlordId) {
                console.error('No landlord ID found! User object:', user);
                alert('Error: Unable to identify user. Please log in again.');
                setIsSubmitting(false);
                return;
            }

            // Create development request payload
            const payload = {
                title: `Development Request - ${formData.address}`,
                location: formData.address,
                description: formData.description + (formData.landArea ? ` | Land Area: ${formData.landArea}` : ''),
                images: formData.image ? [formData.image] : [],
                budget: 0, // Development requests don't have a fixed budget yet
                owner: landlordId,
                status: 'Open',
            };

            console.log('Creating development request:', payload);

            await projectService.create(payload);

            alert('Development request submitted successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create development request', error);
            alert('Failed to submit development request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box bg="#0a0a0f" minH="100vh" color="white">
            <Navbar variant="solid" />

            <Box
                maxW="800px"
                mx="auto"
                px="6"
                pt="32"
                pb="16"
            >
                {/* Page Header */}
                <VStack mb="10" textAlign="center">
                    <Heading
                        fontFamily="'Playfair Display', serif"
                        fontSize={{ base: '2rem', md: '2.5rem' }}
                        fontWeight="600"
                    >
                        List for <Text as="span" color="#d4af37">Development</Text>
                    </Heading>
                    <Text color="#a0a0a0" fontSize="lg">
                        Submit your property for development opportunities.
                    </Text>
                </VStack>

                {/* Development Request Form */}
                <DevRequestForm
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    showBoostOption={true}
                    wantsBoost={wantsBoost}
                    onBoostChange={setWantsBoost}
                />
            </Box>

            <Footer />
        </Box>
    );
};

export default ListForDevelopmentPage;
