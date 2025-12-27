import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div
                    style={{
                        background: 'var(--color-primary, #0a0a0f)',
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <h1 style={{
                        fontSize: '2rem',
                        marginBottom: '1rem',
                        color: 'var(--color-accent, #d4af37)'
                    }}>
                        Something went wrong
                    </h1>
                    <p style={{
                        color: '#a0a0a0',
                        marginBottom: '2rem',
                        maxWidth: '500px'
                    }}>
                        We encountered an error while loading this page.
                        Please try refreshing or go back to the homepage.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'var(--color-accent, #d4af37)',
                                color: '#0a0a0f',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/properties'}
                            style={{
                                background: 'transparent',
                                color: 'var(--color-accent, #d4af37)',
                                border: '1px solid var(--color-accent, #d4af37)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Back to Listings
                        </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            textAlign: 'left',
                            maxWidth: '800px',
                            width: '100%'
                        }}>
                            <summary style={{ cursor: 'pointer', color: '#666' }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{
                                background: '#1a1a2a',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '0.8rem',
                                color: '#f87171'
                            }}>
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
