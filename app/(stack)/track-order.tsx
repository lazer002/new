import React from 'react';

const TrackOrder = () => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', color: '#000', padding: '20px' }}>
            <header style={{ borderBottom: '1px solid #e6e6e6', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1 style={{ color: '#000', fontSize: '24px' }}>Track Your Order</h1>
            </header>
            <main>
                <form style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <label htmlFor="orderId" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Order ID
                    </label>
                    <input
                        type="text"
                        id="orderId"
                        name="orderId"
                        placeholder="Enter your order ID"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e6e6e6',
                            borderRadius: '4px',
                            marginBottom: '20px',
                        }}
                    />
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e6e6e6',
                            borderRadius: '4px',
                            marginBottom: '20px',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#008060',
                            color: '#fff',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Track Order
                    </button>
                </form>
            </main>
        </div>
    );
};

export default TrackOrder;