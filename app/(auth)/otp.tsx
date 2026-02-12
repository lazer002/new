import React from "react";

const OTPPage = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Verify Your OTP</h1>
                <p style={styles.subtitle}>
                    Enter the OTP sent to your registered email or phone number.
                </p>
                <form style={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        maxLength={6}
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>
                        Verify
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
    },
    card: {
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%",
    },
    title: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#000000",
        marginBottom: "1rem",
    },
    subtitle: {
        fontSize: "1rem",
        color: "#555555",
        marginBottom: "2rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.75rem",
        fontSize: "1rem",
        border: "1px solid #cccccc",
        borderRadius: "4px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    button: {
        padding: "0.75rem",
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: "#008060",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
};

export default OTPPage;