import React from 'react';
import { Box, VStack, HStack, Text, Icon, Heading, Flex } from '@chakra-ui/react';
import { Dialog } from '../ui/Dialog';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';

/**
 * Reusable Modal Component
 * Uses Chakra UI Dialog with LuxeEstate styling
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string
 * - icon: React component (optional)
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - children: modal content
 * - footer: footer content (optional)
 * - showCloseButton: boolean (default: true)
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    icon,
    size = 'md',
    children,
    footer,
    showCloseButton = true,
}) => {
    // Size configurations
    const sizeStyles = {
        sm: { maxWidth: '400px' },
        md: { maxWidth: '520px' },
        lg: { maxWidth: '700px' },
        xl: { maxWidth: '900px' },
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Content
                style={{
                    background: 'linear-gradient(180deg, #14141f 0%, #0a0a0f 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    width: '95%',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)',
                    ...sizeStyles[size],
                }}
            >
                {/* Header */}
                <Box
                    p="6"
                    borderBottom="1px solid rgba(255,255,255,0.05)"
                    background="linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%)"
                >
                    <Flex justify="space-between" align="center">
                        <HStack gap="3">
                            {icon && (
                                <Box
                                    p="3"
                                    borderRadius="12px"
                                    background="linear-gradient(135deg, #d4af37, #c5a028)"
                                    boxShadow="0 4px 15px rgba(212, 175, 55, 0.4)"
                                >
                                    <Icon color="#0a0a0f" boxSize="5">
                                        {icon}
                                    </Icon>
                                </Box>
                            )}
                            <Heading
                                size="md"
                                color="white"
                                fontFamily="'Playfair Display', serif"
                            >
                                {title}
                            </Heading>
                        </HStack>

                        {showCloseButton && (
                            <Box
                                cursor="pointer"
                                onClick={onClose}
                                p="2"
                                borderRadius="8px"
                                transition="all 0.2s ease"
                                _hover={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                <Icon color="#a0a0a0" boxSize="4">
                                    <FaTimes />
                                </Icon>
                            </Box>
                        )}
                    </Flex>
                </Box>

                {/* Body */}
                <Box p="6">
                    {children}
                </Box>

                {/* Footer */}
                {footer && (
                    <Box
                        p="6"
                        borderTop="1px solid rgba(255,255,255,0.05)"
                    >
                        {footer}
                    </Box>
                )}
            </Dialog.Content>
        </Dialog.Root>
    );
};

/**
 * Modal Footer Helper Component
 * Provides consistent footer layout with action buttons
 */
export const ModalFooter = ({ children, justify = 'flex-end' }) => (
    <Flex justify={justify} gap="3">
        {children}
    </Flex>
);

/**
 * Confirmation Modal - Pre-built variant for confirmations
 */
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'primary', // 'primary' or 'danger'
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="sm"
        footer={
            <ModalFooter justify="flex-end">
                <Button variant="ghost" onClick={onClose}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </ModalFooter>
        }
    >
        <Text color="#a0a0a0" fontSize="md">
            {message}
        </Text>
    </Modal>
);

export default Modal;
