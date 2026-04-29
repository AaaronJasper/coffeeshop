import { useState, useEffect } from "react";
import "./App.css";
import { FiUnlock } from "react-icons/fi";

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("staffToken");
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(path, { ...options, headers });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}


function OrderCard({ order, updateStatus, isArchive, isAllView, onClick  }) {
    return (

        <div
            className={`order-card ${isAllView ? "summary" : ""}`}
            onClick={isAllView ? onClick : undefined}>

            <div className="order-card-header">
                <h3>Order {order.displayId || `#${order.id}`}</h3>
                <span className="ordertime">{order.orderTime}</span>
            </div>

            <div className={`status-badge ${order.status}`}>
                {order.status}
            </div>

            {!isAllView && (
                <div className="items-list">
                    {order.items.map((item, index) => (
                        <p key={index}>{item}</p>
                    ))}
                </div>
            )}

            <p className="item-count">{order.items.length} items</p>
            {!isAllView && !isArchive && (
                <>
                    <div className="card-actions">
                        {order.backendStatus === "NEW" && (
                            <button onClick={() => updateStatus(order.id, "accepted")}>
                                Accept order
                            </button>
                        )}

                        {order.backendStatus === "ACCEPTED" && (
                            <button onClick={() => updateStatus(order.id, "in-progress")}>
                                Start preparing
                            </button>
                        )}

                        {order.backendStatus === "PREPARING" && (
                            <button onClick={() => updateStatus(order.id, "ready")}>
                                Mark as ready
                            </button>
                        )}

                        {order.backendStatus === "READY" && (
                            <button onClick={() => updateStatus(order.id, "archived")}>
                                Collect
                            </button>
                        )}
                    </div>

                    {order.backendStatus !== "cancelled" && (
                        <button
                            className="cancel-btn"
                            onClick={() => updateStatus(order.id, "cancelled")}
                        >
                            Cancel
                        </button>
                    )}
                </>
            )}
        </div>
    );
}


export function App() {
    const [view, setView] = useState("staff");
    const [activeTab, setActiveTab] = useState("all");
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("staffToken"));
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);

    // auth form state
    const [authTab, setAuthTab] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    function formatOrders(data) {
        return data.map(order => ({
            id: order.id,
            displayId: `#${order.id}`,
            backendStatus: order.status,
            status: mapStatus(order.status),
            orderTime: new Date(order.orderTime).toLocaleTimeString(),
            items: order.items?.map(item =>
                `${item.quantity} x ${item.menuItem?.name} (${item.size})`
            ) || []
        }));
    }

    function fetchActiveOrders() {
        fetch("/api/staff/orders")
            .then((res) => res.json())
            .then((data) => setOrders(formatOrders(data)))
            .catch((error) => console.error("Failed to load orders:", error));
    }

    useEffect(() => {
        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (view === "archive") {
            fetch("/api/staff/orders/archive")
                .then(res => res.json())
                .then(data => {
                    const formatted = data.map(order => ({
                        id: order.id,
                        displayId: `#${order.id}`,
                        backendStatus: order.status,
                        status: mapStatus(order.status),
                        orderTime: new Date(order.orderTime).toLocaleTimeString(),
                        items: order.items?.map(
                            item => `${item.quantity} x ${item.menuItem?.name} (${item.size})`
                        ) || []
                    }));

                    setArchivedOrders(formatted);
                })
                .catch(err => console.error(err));
        }
    }, [view]);


    const currentOrders =
        view === "archive" ? archivedOrders : orders;

    const filteredOrders =
        activeTab === "all"
            ? currentOrders
            : currentOrders.filter((order) => order.status === activeTab);

    function mapStatus(status) {
        switch (status) {
            case "NEW":
            case "ACCEPTED":
                return "accepted";
            case "PREPARING":
                return "in-progress";
            case "READY":
                return "ready";
            case "COLLECTED":
                return "completed";
            case "CANCELLED":
                return "cancelled";
            default:
                return "unknown";
        }
    }

    function updateStatus(id, newStatus) {
        const statusMap = {
            accepted: "ACCEPTED",
            "in-progress": "PREPARING",
            ready: "READY",
            cancelled: "CANCELLED",
            archived: "COLLECTED",
        };

        const backendStatus = statusMap[newStatus];

        fetch(`/api/staff/orders/${id}/status?status=${backendStatus}`, {
            method: "PATCH",
        })
            .then(() => fetchActiveOrders())
            .catch((err) => console.error("Failed to update status:", err));
    }


    async function handleLogin(e) {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const data = await apiFetch("/api/v1/auth/authenticate", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (data.role !== "STAFF") {
                setAuthError("Access denied. Staff accounts only.");
                return;
            }
            localStorage.setItem("staffToken", data.token);
            setIsLoggedIn(true);
        } catch {
            setAuthError("Invalid email or password.");
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const data = await apiFetch("/api/v1/auth/register", {
                method: "POST",
                body: JSON.stringify({ firstname, lastname, email, password, role: "STAFF" }),
            });
            localStorage.setItem("staffToken", data.token);
            setIsLoggedIn(true);
        } catch {
            setAuthError("Registration failed. Email may already be in use.");
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleLogout() {
        const token = localStorage.getItem("staffToken");
        if (token) {
            await fetch("/api/v1/auth/logout", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
        }
        localStorage.removeItem("staffToken");
        setIsLoggedIn(false);
        setEmail("");
        setPassword("");
        setFirstname("");
        setLastname("");
    }

    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <h1>Group 8 Cafe</h1>
                    <p>Staff Portal</p>

                    <div className="auth-tabs">
                        <button
                            className={authTab === "login" ? "active" : ""}
                            onClick={() => { setAuthTab("login"); setAuthError(""); }}
                        >
                            Login
                        </button>
                        <button
                            className={authTab === "register" ? "active" : ""}
                            onClick={() => { setAuthTab("register"); setAuthError(""); }}
                        >
                            Register
                        </button>
                    </div>

                    <hr />

                    {authTab === "login" ? (
                        <form onSubmit={handleLogin}>
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="staff@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            {authError && <p className="auth-error">{authError}</p>}
                            <button type="submit" disabled={authLoading}>
                                {authLoading ? "Signing in..." : "Login"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="First name"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                                required
                            />
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                                required
                            />
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="staff@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Choose a password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            {authError && <p className="auth-error">{authError}</p>}
                            <button type="submit" disabled={authLoading}>
                                {authLoading ? "Registering..." : "Create Staff Account"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="container">
            <h1 className="header">Group 8 Cafe</h1>

            <div className="switch-buttons">
                <button onClick={() => setView("staff")}
                        className={view === "staff" ? "active" : ""}>
                    Staff Dashboard
                </button>

                <button onClick={() => setView("archive")}
                        className={`nav ${view === "archive" ? "active" : ""}`}>
                    Archive Dashboard
                </button>
            </div>




                    <div className="tabs">
                        {view === "staff" && (
                            <>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={activeTab === "all" ? "active" : ""}
                        >
                            All
                        </button>

                        <button
                            onClick={() => setActiveTab("accepted")}
                            className={`nav ${activeTab === "accepted" ? "active" : ""}`}
                        >
                            Accepted
                        </button>

                        <button
                            onClick={() => setActiveTab("in-progress")}
                            className={`nav ${activeTab === "in-progress" ? "active" : ""}`}
                        >
                            In Progress
                        </button>

                        <button
                            onClick={() => setActiveTab("ready")}
                            className={`nav ${activeTab === "ready" ? "active" : ""}`}
                        >
                            Ready for Collection
                        </button>

                    </>
                    )}

                    {view === "archive" && (
                        <>
                        <button
                            onClick={() => setActiveTab("all")}
                            className={activeTab === "all" ? "active" : ""}
                        >
                            All
                        </button>

                            <button
                                onClick={() => setActiveTab("completed")}
                                className={activeTab === "completed" ? "active" : ""}
                            >
                                Completed
                            </button>

                            <button
                                onClick={() => setActiveTab("cancelled")}
                                className={activeTab === "cancelled" ? "active" : ""}
                            >
                                Cancelled
                            </button>
                        </>
                    )}
                    </div>

                <div className="order-grid">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.id}
                                   order={order}
                                   updateStatus={updateStatus}
                                   isArchive={view === "archive"}
                                   isAllView={view === "staff" && activeTab === "all"}
                                   onClick={() => setSelectedOrder(order)}
                        />

                    ))}
                </div>



            <button
                className="logout-btn"
                onClick={handleLogout}>
                <FiUnlock />
                Logout
            </button>
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Order {selectedOrder.id}</h2>
                        <p>Time: {selectedOrder.orderTime}</p>
                        <p>Status: {selectedOrder.status}</p>

                        <div>
                            {selectedOrder.items.map((item, index) => (
                                <p key={index}>{item}</p>
                            ))}
                        </div>

                        <button onClick={() => setSelectedOrder(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>


    );
}