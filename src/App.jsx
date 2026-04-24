import { useState } from "react";
import "./App.css";

const orders = [
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
];

function OrderCard({ order }) {
    return (
        <div className="order-card">
            <div className="order-card-header">
                <h3>Order {order.id}</h3>
                <span className="ordertime">{order.orderTime}</span>
            </div>

            <div className={`status-badge ${order.status}`}>
                {order.status}
            </div>

            <div className="items-list">
                {order.items.map((item, index) => (
                    <p key={index}>{item}</p>
                ))}
            </div>

            <p className="item-count">{order.items.length} items</p>
        </div>
    );
}




/* Whistlestop Coffee Hut nav */
export default function App() {
    const [view, setView] = useState("staff");
    const [activeTab, setActiveTab] = useState("all");
    const filteredOrders =
        activeTab === "all"
            ? orders
            : orders.filter((order) => order.status === activeTab);

    return (
        <div className="container">
            <h1 className="header">Whistlestop Coffee Hut</h1>

            <div className="switch-buttons">
                <button onClick={() => setView("staff")}>
                    Staff Dashboard
                </button>

                <button onClick={() => setView("archive")} className="nav">
                    Archive Dashboard
                </button>
            </div>

            {view === "staff" ? (
                <>
                    <h2>Staff Dashboard</h2>

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
                    </div>

                    <div className="order-grid">
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <h2>Archive Dashboard</h2>
                    <p>Collected orders will be shown here.</p>
                </>
            )}
        </div>
    );
}