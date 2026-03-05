import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    padding: '40px',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <h1 style={{ fontSize: '36px', color: '#ef4444', marginBottom: '20px' }}>
                        Something went wrong
                    </h1>
                    <pre style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        fontSize: '14px'
                    }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
