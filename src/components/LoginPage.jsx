import { useState } from "react";


export default function LoginPage({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    /**
     * Saves the JWT token after staff login or register.
     */
    function completeAuth(data) {
        localStorage.setItem("staffToken", data.token);
        onLogin();
    }

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

            completeAuth(data);
        } catch  {
            setError("Invalid email or password");
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password,
                    role: "STAFF",
                }),
            });

            if (!res.ok) {
                throw new Error("Register failed");
            }

            const data = await res.json();

            completeAuth(data);
        } catch {
            setError("Unable to register staff account");
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>{mode === "login" ? "Staff Login" : "Staff Register"}</h1>
                <p>Administrative & Staff Access</p>

                <hr />

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={mode === "login" ? "active" : ""}
                        onClick={() => {
                            setMode("login");
                            setError("");
                        }}
                    >
                        Staff
                    </button>
                    <button
                        type="button"
                        className={mode === "register" ? "active" : ""}
                        onClick={() => {
                            setMode("register");
                            setError("");
                        }}
                    >
                        Staff Register
                    </button>
                </div>

                <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
                    {mode === "register" && (
                        <>
                            <label>First name</label>
                            <input
                                type="text"
                                placeholder="First name"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                            />

                            <label>Last name</label>
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                            />
                        </>
                    )}

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
                        {mode === "login" ? "Login" : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}
