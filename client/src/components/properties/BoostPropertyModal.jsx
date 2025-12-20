import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Icon,
    Heading,
    Flex,
    Grid,
    GridItem,
    Input,
    Spinner,
    Badge,
} from '@chakra-ui/react';
import Modal, { ModalFooter } from '../common/Modal';
import Button from '../common/Button';
import { toaster } from '../ui/toaster';
import { FaRocket, FaCreditCard, FaCheck, FaStar, FaCrown, FaShieldAlt } from 'react-icons/fa';

/**
 * BoostPropertyModal Component
 * Multi-step modal for boosting property listings
 * Uses the reusable Modal component from common/
 */
const BoostPropertyModal = ({ isOpen, onClose, onBoostComplete, propertyId, landlordId }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const pricingPlans = [
        {
            id: 'boost-7',
            duration: 7,
            price: 29.99,
            label: '7 Days',
            description: '2x visibility boost',
            icon: FaRocket,
            color: '#4299e1',
        },
        {
            id: 'boost-30',
            duration: 30,
            price: 49.99,
            label: '30 Days',
            description: 'Premium visibility + badge',
            icon: FaCrown,
            color: '#d4af37',
            popular: true,
        },
        {
            id: 'boost-90',
            duration: 90,
            price: 99.99,
            label: '90 Days',
            description: 'Maximum exposure + priority',
            icon: FaShieldAlt,
            color: '#9f7aea',
        },
    ];

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handlePayment = async () => {
        if (!cardNumber || !expiryDate || !cvv) {
            toaster.create({
                title: 'Missing Information',
                description: 'Please fill in all payment fields',
                type: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const response = await fetch('http://localhost:5000/api/boosts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId,
                    landlordId,
                    duration: selectedPlan.duration,
                    amount: selectedPlan.price,
                    paymentMethod: 'card',
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStep(3);
                toaster.create({
                    title: 'Boost Activated!',
                    description: `Your property is now boosted for ${selectedPlan.duration} days`,
                    type: 'success',
                });
                if (onBoostComplete) onBoostComplete(data.data);
            } else {
                throw new Error(data.message || 'Boost failed');
            }
        } catch (error) {
            toaster.create({
                title: 'Payment Failed',
                description: error.message || 'Something went wrong.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedPlan(null);
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        onClose();
    };

    const inputStyles = {
        bg: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: 'white',
        p: '4',
        _focus: {
            borderColor: '#d4af37',
            boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15)',
        },
        _placeholder: { color: 'gray.500' },
    };

    // Render footer based on step
    const renderFooter = () => {
        if (step === 1) {
            return (
                <ModalFooter justify="flex-end">
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            );
        }

        if (step === 2) {
            return (
                <ModalFooter justify="space-between">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                        Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePayment}
                        isLoading={loading}
                        leftIcon={<FaCreditCard />}
                    >
                        Pay ${selectedPlan?.price}
                    </Button>
                </ModalFooter>
            );
        }

        return (
            <ModalFooter justify="flex-end">
                <Button variant="primary" onClick={handleClose}>
                    Done
                </Button>
            </ModalFooter>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Boost Your Listing"
            icon={<FaRocket />}
            size="md"
            footer={renderFooter()}
        >
            {/* Step 1: Select Plan */}
            {step === 1 && (
                <VStack gap="4" align="stretch">
                    <Text color="#a0a0a0" mb="2">
                        Get more visibility and attract buyers faster
                    </Text>

                    {pricingPlans.map((plan) => (
                        <Box
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan)}
                            cursor="pointer"
                            p="5"
                            borderRadius="16px"
                            border={plan.popular ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.1)'}
                            background={plan.popular ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)'}
                            position="relative"
                            transition="all 0.3s ease"
                            _hover={{
                                borderColor: '#d4af37',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 10px 30px rgba(212, 175, 55, 0.15)',
                            }}
                        >
                            {plan.popular && (
                                <Badge
                                    position="absolute"
                                    top="-10px"
                                    right="16px"
                                    background="linear-gradient(135deg, #d4af37, #c5a028)"
                                    color="#0a0a0f"
                                    px="3"
                                    py="1"
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    display="flex"
                                    alignItems="center"
                                    gap="1"
                                >
                                    <FaStar size={10} /> POPULAR
                                </Badge>
                            )}
                            <Flex justify="space-between" align="center">
                                <HStack gap="4">
                                    <Box
                                        p="3"
                                        borderRadius="12px"
                                        background={`linear-gradient(135deg, ${plan.color}33, ${plan.color}11)`}
                                    >
                                        <Icon color={plan.color} boxSize="5">
                                            <plan.icon />
                                        </Icon>
                                    </Box>
                                    <Box>
                                        <Text color="white" fontWeight="600" fontSize="lg">
                                            {plan.label}
                                        </Text>
                                        <Text color="gray.400" fontSize="sm">
                                            {plan.description}
                                        </Text>
                                    </Box>
                                </HStack>
                                <Text color="#d4af37" fontSize="2xl" fontWeight="bold">
                                    ${plan.price}
                                </Text>
                            </Flex>
                        </Box>
                    ))}
                </VStack>
            )}

            {/* Step 2: Payment */}
            {step === 2 && selectedPlan && (
                <VStack gap="5" align="stretch">
                    {/* Selected Plan Summary */}
                    <Box
                        p="4"
                        borderRadius="12px"
                        background="linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))"
                        border="1px solid rgba(212, 175, 55, 0.3)"
                    >
                        <Flex justify="space-between" align="center">
                            <HStack gap="3">
                                <Icon color={selectedPlan.color} boxSize="5">
                                    <selectedPlan.icon />
                                </Icon>
                                <Text color="white" fontWeight="500">
                                    {selectedPlan.label} Boost
                                </Text>
                            </HStack>
                            <Text color="#d4af37" fontSize="xl" fontWeight="bold">
                                ${selectedPlan.price}
                            </Text>
                        </Flex>
                    </Box>

                    {/* Payment Form */}
                    <VStack gap="4" align="stretch">
                        <Box>
                            <Text color="gray.400" fontSize="sm" mb="2" display="flex" alignItems="center" gap="2">
                                <FaCreditCard /> Card Number
                            </Text>
                            <Input
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                maxLength={19}
                                {...inputStyles}
                            />
                        </Box>

                        <Grid templateColumns="1fr 1fr" gap="4">
                            <GridItem>
                                <Text color="gray.400" fontSize="sm" mb="2">Expiry Date</Text>
                                <Input
                                    placeholder="MM/YY"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    maxLength={5}
                                    {...inputStyles}
                                />
                            </GridItem>
                            <GridItem>
                                <Text color="gray.400" fontSize="sm" mb="2">CVV</Text>
                                <Input
                                    placeholder="123"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    maxLength={4}
                                    {...inputStyles}
                                />
                            </GridItem>
                        </Grid>

                        <Text color="gray.500" fontSize="xs" textAlign="center" mt="2">
                            🔒 Secure mock payment - no real charges
                        </Text>
                    </VStack>
                </VStack>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <VStack gap="6" py="8">
                    <Box
                        w="100px"
                        h="100px"
                        borderRadius="full"
                        background="linear-gradient(135deg, #d4af37, #c5a028)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 0 40px rgba(212, 175, 55, 0.4)"
                    >
                        <Icon color="#0a0a0f" boxSize="10">
                            <FaCheck />
                        </Icon>
                    </Box>
                    <VStack gap="2">
                        <Heading size="lg" color="white" fontFamily="'Playfair Display', serif">
                            Boost Activated!
                        </Heading>
                        <Text color="#a0a0a0" textAlign="center" maxW="300px">
                            Your property is now featured and will appear at the top of search results for{' '}
                            <Text as="span" color="#d4af37" fontWeight="600">
                                {selectedPlan?.duration} days
                            </Text>
                        </Text>
                    </VStack>
                </VStack>
            )}
        </Modal>
    );
};

export default BoostPropertyModal;
