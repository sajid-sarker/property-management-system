'use client'

import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react'
import * as React from 'react'

// Dialog Root wrapper
export const DialogRoot = React.forwardRef(function DialogRoot(props, ref) {
    const { children, ...rest } = props
    return (
        <ChakraDialog.Root {...rest}>
            {children}
        </ChakraDialog.Root>
    )
})

// Dialog Trigger
export const DialogTrigger = ChakraDialog.Trigger

// Dialog Content wrapper with Portal
export const DialogContent = React.forwardRef(function DialogContent(props, ref) {
    const { children, portalled = true, portalRef, ...rest } = props
    return (
        <Portal disabled={!portalled} container={portalRef}>
            <ChakraDialog.Backdrop />
            <ChakraDialog.Positioner>
                <ChakraDialog.Content ref={ref} {...rest}>
                    {children}
                </ChakraDialog.Content>
            </ChakraDialog.Positioner>
        </Portal>
    )
})

// Dialog Header
export const DialogHeader = React.forwardRef(function DialogHeader(props, ref) {
    return <ChakraDialog.Header ref={ref} {...props} />
})

// Dialog Title
export const DialogTitle = React.forwardRef(function DialogTitle(props, ref) {
    return <ChakraDialog.Title ref={ref} {...props} />
})

// Dialog Description
export const DialogDescription = React.forwardRef(function DialogDescription(props, ref) {
    return <ChakraDialog.Description ref={ref} {...props} />
})

// Dialog Body
export const DialogBody = React.forwardRef(function DialogBody(props, ref) {
    return <ChakraDialog.Body ref={ref} {...props} />
})

// Dialog Footer
export const DialogFooter = React.forwardRef(function DialogFooter(props, ref) {
    return <ChakraDialog.Footer ref={ref} {...props} />
})

// Dialog Close Trigger
export const DialogCloseTrigger = React.forwardRef(function DialogCloseTrigger(props, ref) {
    return <ChakraDialog.CloseTrigger ref={ref} {...props} />
})

// Dialog Action Trigger
export const DialogActionTrigger = React.forwardRef(function DialogActionTrigger(props, ref) {
    return <ChakraDialog.ActionTrigger ref={ref} {...props} />
})

// Export everything as Dialog namespace for convenience
export const Dialog = {
    Root: DialogRoot,
    Trigger: DialogTrigger,
    Content: DialogContent,
    Header: DialogHeader,
    Title: DialogTitle,
    Description: DialogDescription,
    Body: DialogBody,
    Footer: DialogFooter,
    CloseTrigger: DialogCloseTrigger,
    ActionTrigger: DialogActionTrigger,
}
