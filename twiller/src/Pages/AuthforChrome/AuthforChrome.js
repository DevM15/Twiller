import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { useLocation } from "react-router-dom";


const Login = () => {
    const port = process.env.PORT || "localhost:5000";
    const [otp, setOtp] = useState('');

    const navigate = useNavigate();

    const location = useLocation();
    const email = location.state?.email

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`http://${port}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        alert(data.message);
        navigate("/")
        return
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: "center" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <>
                    <p>OTP sent to {email}</p>
                    <label>OTP:</label><br />
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    /><br /><br />
                </>


                <button type="submit">Verify OTP</button>
            </form>
        </div>
    );
};

export default Login;
