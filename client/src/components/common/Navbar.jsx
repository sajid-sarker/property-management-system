import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/api';
import Button from './Button';

/**
 * Reusable Navbar Component
 * Variants: transparent (for hero sections), solid (for internal pages)
 */
const Navbar = ({ variant = 'auto' }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user) {
                try {
                    const response = await messageService.getUnreadCount();
                    setUnreadCount(response.data?.count || 0);
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                }
            }
        };
        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const isTransparent = variant === 'transparent' || (variant === 'auto' && location.pathname === '/');
    const showSolid = variant === 'solid' || scrolled || !isTransparent;

    const navLinks = [
        { to: '/properties', label: 'Properties' },
        { to: '/development-requests', label: 'Dev Requests' },
        { to: '/wishlist', label: 'Wishlist' },
    ];

    return (
        <Box
            as="nav"
            position="fixed"
            top="0"
            left="0"
            right="0"
            zIndex="1000"
            py={showSolid ? 3 : 4}
            px={6}
            background={showSolid ? 'rgba(10, 10, 15, 0.95)' : 'transparent'}
            backdropFilter={showSolid ? 'blur(20px)' : 'none'}
            borderBottom={showSolid ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'}
            transition="all 0.3s ease"
        >
            <Flex
                maxW="1400px"
                mx="auto"
                justify="space-between"
                align="center"
            >
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Text
                        fontFamily="'Playfair Display', serif"
                        fontSize="1.75rem"
                        fontWeight="700"
                        color="white"
                        letterSpacing="1px"
                    >
                        Luxe<Text as="span" color="#d4af37">Estate</Text>
                    </Text>
                </Link>

                {/* Desktop Navigation Links */}
                <HStack gap={8} display={{ base: 'none', md: 'flex' }}>
                    {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
                            <Text
                                color={location.pathname === link.to ? '#d4af37' : '#a0a0a0'}
                                fontSize="0.9rem"
                                fontWeight="500"
                                letterSpacing="0.5px"
                                transition="color 0.2s ease"
                                _hover={{ color: '#d4af37' }}
                            >
                                {link.label}
                            </Text>
                        </Link>
                    ))}
                </HStack>

                {/* Auth Buttons */}
                <HStack gap={3}>
                    {user ? (
                        <>
                            <Link to="/dashboard" style={{ position: 'relative' }}>
                                <Button variant="ghost" size="sm" leftIcon={<FaUser />}>
                                    Dashboard
                                    {unreadCount > 0 && (
                                        <Box
                                            as="span"
                                            position="absolute"
                                            top="-2px"
                                            right="-2px"
                                            bg="red.500"
                                            color="white"
                                            fontSize="0.65rem"
                                            fontWeight="bold"
                                            borderRadius="full"
                                            minW="18px"
                                            h="18px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            px={1}
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Box>
                                    )}
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="primary" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register" style={{ display: 'none' }}>
                                <Button variant="outline" size="sm">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Box
                        display={{ base: 'block', md: 'none' }}
                        cursor="pointer"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Icon color="white" boxSize={6}>
                            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                        </Icon>
                    </Box>
                </HStack>
            </Flex>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    background="rgba(10, 10, 15, 0.98)"
                    backdropFilter="blur(20px)"
                    borderBottom="1px solid rgba(255, 255, 255, 0.05)"
                    py={4}
                    display={{ base: 'block', md: 'none' }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ textDecoration: 'none', display: 'block' }}
                        >
                            <Text
                                py={3}
                                px={6}
                                color={location.pathname === link.to ? '#d4af37' : 'white'}
                                _hover={{ background: 'rgba(212, 175, 55, 0.1)' }}
                            >
                                {link.label}
                            </Text>
                        </Link>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Navbar;
