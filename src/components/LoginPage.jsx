import { useState } from "react";


export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/v1/auth/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                throw new Error("Login failed");
            }

            const data = await res.json();

            localStorage.setItem("staffToken", data.token);
            onLogin();
        } catch  {
            setError("Invalid email or password");
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Staff Login</h1>
                <p>Administrative & Staff Access</p>

                <hr />

                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="staff@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="auth-error">{error}</p>}

                    <button className="login-btn" type="submit">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}