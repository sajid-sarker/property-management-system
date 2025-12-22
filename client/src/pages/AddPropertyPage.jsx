import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { propertyService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Import reusable components from common and properties folders
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PropertyForm from '../components/properties/PropertyForm';
import BoostPropertyModal from '../components/properties/BoostPropertyModal';

/**
 * AddPropertyPage - Page for creating new property listings
 * Uses reusable components: Navbar, Footer, PropertyForm, BoostPropertyModal
 */
const AddPropertyPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
    const [wantsBoost, setWantsBoost] = useState(false);
    const [createdPropertyId, setCreatedPropertyId] = useState(null);
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

            console.log('Creating property with landlord ID:', landlordId);

            const response = await propertyService.create({
                ...formData,
                landlord: landlordId,
            });

            const newProperty = response.data?.data || response.data;

            if (wantsBoost && newProperty) {
                setCreatedPropertyId(newProperty._id || newProperty.id);
                setIsBoostModalOpen(true);
            } else {
                alert('Property listed successfully!');
                navigate('/properties');
            }
        } catch (error) {
            console.error('Failed to create property', error);
            alert('Failed to create property. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBoostComplete = (boostData) => {
        console.log('Boost completed:', boostData);
        setIsBoostModalOpen(false);
        alert('Property listed and boosted successfully!');
        navigate('/properties');
    };

    const handleBoostModalClose = () => {
        setIsBoostModalOpen(false);
        alert('Property listed successfully! (Not boosted)');
        navigate('/properties');
    };

    return (
        <Box bg="#0a0a0f" minH="100vh" color="white">
            {/* Reusable Navbar Component */}
            <Navbar variant="solid" />

            {/* Page Content */}
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
                        List Your <Text as="span" color="#d4af37">Property</Text>
                    </Heading>
                    <Text color="#a0a0a0" fontSize="lg">
                        Join our exclusive collection of premium residences.
                    </Text>
                </VStack>

                {/* Reusable Property Form Component */}
                <PropertyForm
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                    showBoostOption={true}
                    wantsBoost={wantsBoost}
                    onBoostChange={setWantsBoost}
                />
            </Box>

            {/* Boost Modal */}
            <BoostPropertyModal
                isOpen={isBoostModalOpen}
                onClose={handleBoostModalClose}
                onBoostComplete={handleBoostComplete}
                propertyId={createdPropertyId}
                landlordId={user?._id || user?.id}
            />

            {/* Reusable Footer Component */}
            <Footer />
        </Box>
    );
};

export default AddPropertyPage;
