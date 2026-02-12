import React from 'react';

const Cart = () => {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f9f9f9' }}>
            <h1 style={{ color: '#000', borderBottom: '2px solid #000', paddingBottom: '10px' }}>Your Cart</h1>
            <div style={{ marginTop: '20px' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    <div>
                        <h2 style={{ margin: '0', color: '#000' }}>Product Name</h2>
                        <p style={{ margin: '0', color: '#666' }}>Description of the product</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', color: '#000' }}>$50.00</p>
                        <button
                            style={{
                                backgroundColor: '#008000',
                                color: '#fff',
                                border: 'none',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                            }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <h2 style={{ color: '#000' }}>Total: $50.00</h2>
                <button
                    style={{
                        backgroundColor: '#008000',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '16px',
                    }}
                >
                    Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;