import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, HStack, VStack, Text, Icon } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

/**
 * Reusable Footer Component
 * Displays site info, navigation links, and social media
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { to: '/', label: 'Home' },
        { to: '/properties', label: 'Properties' },
        { to: '/development-requests', label: 'Dev Requests' },
        { to: '/wishlist', label: 'Wishlist' },
    ];

    const socialLinks = [
        { icon: FaFacebook, href: '#', label: 'Facebook' },
        { icon: FaTwitter, href: '#', label: 'Twitter' },
        { icon: FaInstagram, href: '#', label: 'Instagram' },
        { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    ];

    return (
        <Box
            as="footer"
            background="#0a0a0f"
            borderTop="1px solid rgba(255, 255, 255, 0.05)"
            py={16}
            px={6}
        >
            <Box maxW="1400px" mx="auto">
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'center', md: 'flex-start' }}
                    gap={8}
                    mb={12}
                >
                    {/* Logo & Description */}
                    <VStack align={{ base: 'center', md: 'flex-start' }} maxW="300px">
                        <Text
                            fontFamily="'Playfair Display', serif"
                            fontSize="2rem"
                            fontWeight="700"
                            color="white"
                            mb={3}
                        >
                            Luxe<Text as="span" color="#d4af37">Estate</Text>
                        </Text>
                        <Text color="#a0a0a0" fontSize="0.9rem" textAlign={{ base: 'center', md: 'left' }}>
                            Curating the world's finest properties for discerning buyers and investors.
                        </Text>
                    </VStack>

                    {/* Navigation Links */}
                    <VStack align={{ base: 'center', md: 'flex-start' }}>
                        <Text color="white" fontWeight="600" mb={3} fontSize="0.9rem" textTransform="uppercase" letterSpacing="1px">
                            Quick Links
                        </Text>
                        {footerLinks.map((link) => (
                            <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
                                <Text
                                    color="#a0a0a0"
                                    fontSize="0.9rem"
                                    transition="color 0.2s ease"
                                    _hover={{ color: '#d4af37' }}
                                >
                                    {link.label}
                                </Text>
                            </Link>
                        ))}
                    </VStack>

                    {/* Contact Info */}
                    <VStack align={{ base: 'center', md: 'flex-start' }}>
                        <Text color="white" fontWeight="600" mb={3} fontSize="0.9rem" textTransform="uppercase" letterSpacing="1px">
                            Contact
                        </Text>
                        <Text color="#a0a0a0" fontSize="0.9rem">support@luxeestate.com</Text>
                        <Text color="#a0a0a0" fontSize="0.9rem">+880 1234-567890</Text>
                        <Text color="#a0a0a0" fontSize="0.9rem">Dhaka, Bangladesh</Text>
                    </VStack>

                    {/* Social Links */}
                    <VStack align={{ base: 'center', md: 'flex-start' }}>
                        <Text color="white" fontWeight="600" mb={3} fontSize="0.9rem" textTransform="uppercase" letterSpacing="1px">
                            Follow Us
                        </Text>
                        <HStack gap={4}>
                            {socialLinks.map((social) => (
                                <Box
                                    key={social.label}
                                    as="a"
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    p={2}
                                    borderRadius="8px"
                                    background="rgba(255, 255, 255, 0.05)"
                                    transition="all 0.3s ease"
                                    _hover={{
                                        background: 'rgba(212, 175, 55, 0.2)',
                                        transform: 'translateY(-2px)',
                                    }}
                                >
                                    <Icon color="#d4af37" boxSize={5}>
                                        <social.icon />
                                    </Icon>
                                </Box>
                            ))}
                        </HStack>
                    </VStack>
                </Flex>

                {/* Bottom Bar */}
                <Box
                    pt={8}
                    borderTop="1px solid rgba(255, 255, 255, 0.05)"
                    textAlign="center"
                >
                    <Text color="#6a6a6a" fontSize="0.85rem">
                        © {currentYear} LuxeEstate Property Management. Built with React & MERN Architecture.
                    </Text>
                    <Text color="#6a6a6a" fontSize="0.75rem" mt={2}>
                        Section 18, Group 3 - Property Management System
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;
