import { useState, useEffect } from "react";
import "./App.css";
import { FiUnlock } from "react-icons/fi";


function OrderCard({ order, updateStatus, isArchive, isAllView, onClick  }) {
    return (

        <div
            className={`order-card ${isAllView ? "summary" : ""}`}
            onClick={isAllView ? onClick : undefined}>

            <div className="order-card-header">
                <h3>Order {order.id}</h3>
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
            {!isAllView && (
                <>
            <div className="card-actions">
                {order.status === "accepted" && (
                    <button onClick={() => updateStatus(order.id, "in-progress")}>
                        Start preparing
                    </button>
                )}

                {order.status === "in-progress" && (
                    <button onClick={() => updateStatus(order.id, "ready")}>
                        Mark as ready
                    </button>
                )}


                {!isArchive && order.status === "ready" && (
                    <button onClick={() => updateStatus(order.id, "archived")}>
                        Collect
                    </button>
                )}


            </div>
            {!isArchive && order.status !== "cancelled" && (
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




/* Whistlestop Coffee Hut nav */
export default function App() {
    const [view, setView] = useState("staff");
    const [activeTab, setActiveTab] = useState("all");
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([
        {
            id: "#0001",
            status: "accepted",
            orderTime: "13:21",
            items: ["1 x Americano (L)", "1 x Cappuccino (L)", "1 x Americano with milk"],
        },
        {
            id: "#0002",
            status: "in-progress",
            orderTime: "13:27",
            items: ["1 x Latte (L)", "1 x Cappuccino (L)"],
        },
        {
            id: "#0003",
            status: "ready",
            orderTime: "13:39",
            items: ["1 x Mocha (L)", "1 x Hot Chocolate (L)"],
        },
    ]);
    const filteredOrders =
        activeTab === "all"
            ? orders
            : orders.filter((order) => order.status === activeTab);
    function updateStatus(id, newStatus) {
        if (newStatus === "archived") {
            const orderToArchive = orders.find((order) => order.id === id);
            const updatedOrder = {
                ...orderToArchive,
                status: "completed"
            };
            setArchivedOrders([...archivedOrders, updatedOrder]);
            setOrders(orders.filter((order) => order.id !== id));
            return;
        }

        setOrders(
            orders.map((order) =>
                order.id === id ? { ...order, status: newStatus } : order
            )
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                <h1>Staff Login</h1>
                    <p>Administrative & Staff Access</p>

                    <hr />

                <label>Account Number </label>
                <input type="account number"
                       placeholder="Enter your account number" />
                <label>Password </label>
                 <input type="password"
                        placeholder="Enter your password"/>

                    <button onClick={() => setIsLoggedIn(true)}>
                        Login
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="container">
            <h1 className="header">Whistlestop Coffee Hut</h1>

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

            {view === "staff" ? (
                <>

                    <div className="tabs">
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

                        <button
                            onClick={() => setActiveTab("cancelled")}
                            className={`nav ${activeTab === "cancelled" ? "active" : ""}`}
                        >
                            Cancelled
                        </button>


                    </div>

                    <div className="order-grid">
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.id}
                                       order={order}
                                       updateStatus={updateStatus}
                                       isArchive={false}
                                       isAllView={activeTab === "all"}
                                       onClick={() => setSelectedOrder(order)}
                            />

                        ))}
                    </div>
                </>
            ) : (
                <>

                    <div className="order-grid">
                        {archivedOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                updateStatus={updateStatus}
                                isArchive={true}
                                isAllView={false}
                            />
                        ))}
                    </div>
                </>
            )}

            <button
                className="logout-btn"
                onClick={() => setIsLoggedIn(false)}>
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