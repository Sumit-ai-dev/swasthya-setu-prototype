import React from 'react';

/**
 * Renders a dark-themed test UI that verifies React rendering and styles.
 *
 * Displays a full-viewport container with the heading "Swasthya-Setu Test", a descriptive paragraph,
 * and an info card listing three verification lines.
 * @returns {JSX.Element} The TestApp React element.
 */
function TestApp() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#0f172a', 
            color: 'white',
            padding: '40px',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
                Swasthya-Setu Test
            </h1>
            <p style={{ fontSize: '24px', color: '#94a3b8' }}>
                If you can see this, React is working!
            </p>
            <div style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px'
            }}>
                <p>✅ React is rendering</p>
                <p>✅ Styles are working</p>
                <p>✅ Dark theme is applied</p>
            </div>
        </div>
    );
}

export default TestApp;
