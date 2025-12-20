import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

/**
 * Reusable Button Component
 * Variants: primary, outline, ghost
 * Uses Chakra UI with LuxeEstate gold accent styling
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    isLoading = false,
    isDisabled = false,
    onClick,
    type = 'button',
    fullWidth = false,
    ...props
}) => {
    // Variant styles matching LuxeEstate design
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #d4af37, #c5a028)',
                    color: '#0a0a0f',
                    _hover: {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 24px rgba(212, 175, 55, 0.4)',
                    },
                };
            case 'outline':
                return {
                    background: 'transparent',
                    color: '#d4af37',
                    border: '1px solid #d4af37',
                    _hover: {
                        background: 'rgba(212, 175, 55, 0.1)',
                    },
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: '#a0a0a0',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    _hover: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                    },
                };
            case 'danger':
                return {
                    background: '#dc3545',
                    color: 'white',
                    _hover: {
                        background: '#c82333',
                    },
                };
            default:
                return {};
        }
    };

    // Size styles
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return { px: 4, py: 2, fontSize: 'sm' };
            case 'md':
                return { px: 6, py: 3, fontSize: 'md' };
            case 'lg':
                return { px: 8, py: 4, fontSize: 'lg' };
            default:
                return { px: 6, py: 3, fontSize: 'md' };
        }
    };

    return (
        <ChakraButton
            type={type}
            onClick={onClick}
            disabled={isDisabled || isLoading}
            borderRadius="8px"
            fontWeight="600"
            fontFamily="'Inter', sans-serif"
            transition="all 0.3s ease"
            width={fullWidth ? '100%' : 'auto'}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap="2"
            {...getVariantStyles()}
            {...getSizeStyles()}
            _disabled={{
                opacity: 0.6,
                cursor: 'not-allowed',
                transform: 'none',
            }}
            {...props}
        >
            {leftIcon && <span>{leftIcon}</span>}
            {isLoading ? 'Loading...' : children}
            {rightIcon && <span>{rightIcon}</span>}
        </ChakraButton>
    );
};

export default Button;
