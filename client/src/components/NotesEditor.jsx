import React, { useState, useEffect, useRef } from 'react';

const MAX_CHARACTERS = 500;

/**
 * Enhanced Notes Editor with character counter, save status, and auto-save
 */
const NotesEditor = ({ propertyId, initialNotes = '', onUpdate }) => {
    const [notes, setNotes] = useState(initialNotes);
    const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const debounceTimer = useRef(null);

    const characterCount = notes.length;
    const isOverLimit = characterCount > MAX_CHARACTERS;
    const isNearLimit = characterCount > MAX_CHARACTERS * 0.9; // 90% of limit

    const handleChange = (e) => {
        const newNotes = e.target.value;
        setNotes(newNotes);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set saving status
        setSaveStatus('saving');
        setErrorMessage('');

        // Debounce save (1 second after user stops typing)
        debounceTimer.current = setTimeout(async () => {
            try {
                // Validate character limit
                if (newNotes.length > MAX_CHARACTERS) {
                    setSaveStatus('error');
                    setErrorMessage(`Exceeded limit: ${newNotes.length}/${MAX_CHARACTERS} characters`);
                    return;
                }

                // Call parent update function
                await onUpdate(propertyId, newNotes);
                setSaveStatus('saved');

                // Clear status after 2 seconds
                setTimeout(() => {
                    setSaveStatus(null);
                }, 2000);
            } catch (error) {
                setSaveStatus('error');
                setErrorMessage(error.response?.data?.message || 'Failed to save notes');
            }
        }, 1000);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const getCounterColor = () => {
        if (isOverLimit) return '#f44336';
        if (isNearLimit) return '#ff9800';
        return 'var(--color-text-light)';
    };

    const getSaveStatusIndicator = () => {
        if (saveStatus === 'saving') {
            return <span style={{ color: '#2196F3', fontSize: '0.75rem' }}>● Saving...</span>;
        }
        if (saveStatus === 'saved') {
            return <span style={{ color: '#4CAF50', fontSize: '0.75rem' }}>✓ Saved</span>;
        }
        if (saveStatus === 'error') {
            return <span style={{ color: '#f44336', fontSize: '0.75rem' }}>✗ {errorMessage}</span>;
        }
        return null;
    };

    return (
        <div style={{ marginTop: '0.5rem' }}>
            <textarea
                value={notes}
                onChange={handleChange}
                placeholder="Add personal notes about this property..."
                style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: isOverLimit
                        ? '1px solid #f44336'
                        : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    color: 'var(--color-text-light)',
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                    minHeight: '60px',
                    transition: 'border-color 0.2s'
                }}
            />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.25rem',
                fontSize: '0.75rem'
            }}>
                <span style={{ color: getCounterColor() }}>
                    {characterCount}/{MAX_CHARACTERS} characters
                </span>
                {getSaveStatusIndicator()}
            </div>
        </div>
    );
};

export default NotesEditor;
