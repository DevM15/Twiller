import { useNavigate, Link } from "react-router-dom";
import React, { useState } from 'react';


const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);

    const getUserAgent = () => navigator.userAgent;
    const isChrome = () => /Chrome/i.test(getUserAgent()) && !/Edg/i.test(getUserAgent());
    const isEdge = () => /Edg/i.test(getUserAgent());
    const isMobile = () => /Mobi|Android|iPhone/i.test(getUserAgent());

    const navigate = useNavigate();

    const isWithinAllowedTime = () => {
        const now = new Date();
        const hour = now.getHours();
        return hour >= 10 && hour < 13;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (showOtpField) {
            const res = await fetch('http://localhost:5000/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            alert(data.message);
            navigate("/")
            return;
        }

        // First step: check device/browser/time
        if (isMobile() && !isWithinAllowedTime()) {
            alert('Mobile access allowed only from 10 AM to 1 PM');
            return;
        }

        const userAgent = getUserAgent();

        const res = await fetch('http://localhost:5000/AuthforChrome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                userAgent,
                isMobile: isMobile(),
            }),
        });

        const data = await res.json();
        if (data.requireOTP) {
            setShowOtpField(true);
        } else {
            alert(data.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label><br />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                /><br /><br />

                {showOtpField && (
                    <>
                        <label>OTP:</label><br />
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        /><br /><br />
                    </>
                )}

                <button type="submit">{showOtpField ? 'Verify OTP' : 'Login'}</button>
            </form>
        </div>
    );
};

export default Login;
