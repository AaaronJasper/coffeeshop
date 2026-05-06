import { useEffect, useState } from "react";
import "./App.css";
import { FiUnlock } from "react-icons/fi";
import DashboardSidebar from "./components/DashboardSidebar";
import LoginPage from "./components/LoginPage";
import MenuControl from "./components/MenuControl";
import OrderCard from "./components/OrderCard";
import OrderModal from "./components/OrderModal";




/**
 * Sends an API request and adds the staff token when the user is logged in.
 */
async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("staffToken");
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(path, { ...options, headers });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}


export function App() {
    const [view, setView] = useState("staff");
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState([]);
    const [archivedOrders, setArchivedOrders] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("staffToken"));
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [menu, setMenu] = useState([]);
    const [stockOverrides, setStockOverrides] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("stockOverrides")) || {};
        } catch {
            return {};
        }
    });

    const getMenuItemId = (item) => item.itemId ?? item.id ?? item.menuItemId ?? item.name;
    const isMenuItemAvailable = (item) => {
        const itemId = getMenuItemId(item);

        if (stockOverrides[itemId] !== undefined) {
            return stockOverrides[itemId];
        }

        if (item.isAvailable !== undefined) {
            return item.isAvailable === true || item.isAvailable === "true";
        }

        if (item.itemCount !== undefined) {
            return Number(item.itemCount) > 0;
        }

        return true;
    };

    const isOutOfStock = (itemName) => {
        const found = menu.find((m) => m.name === itemName);
        return found ? !isMenuItemAvailable(found) : false;
    };

    /**
     * Converts backend order status names into CSS-friendly names.
     */
    function mapStatus(status) {
        switch (status) {
            case "NEW":
                return "new";
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

    /**
     * Gets the pickup time from the order response.
     */
    function getPickupTime(order) {
        return order.pickupTime || order.pickUpTime || null;
    }

    /**
     * Formats pickup time so it is easy for staff to read.
     */
    function formatPickupTime(time) {
        if (!time) return "Not set";

        const date = new Date(time);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleTimeString("en-GB", {
                timeZone: "Europe/London",
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return String(time).slice(0, 5);
    }

    function getPickupSortTime(order) {
        const pickupTime = getPickupTime(order);
        const date = new Date(pickupTime);

        if (pickupTime && !Number.isNaN(date.getTime())) {
            return date.getTime();
        }

        return Number.MAX_SAFE_INTEGER;
    }

    /**
     * Prepares backend order data for the dashboard cards.
     */
    function formatOrders(data) {
        console.log("RAW:", data);

        const formatted = data.map((order) => ({
            id: order.id,
            displayId: `#${order.id}`,
            backendStatus: order.status,
            status: mapStatus(order.status),
            orderTime: new Date(order.orderTime).toLocaleTimeString("en-GB", {
                timeZone: "Europe/London",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }),
            pickupTime: formatPickupTime(getPickupTime(order)),
            pickupSortTime: getPickupSortTime(order),

            // formatOrders
            items:
                order.items?.map((item) => ({
                    name: item.menuItem?.name || item.menuItemName || "Unknown item",
                    quantity: item.quantity,
                    size: item.size,
                })) || [],
        }));

        console.log("FORMATTED:", formatted);
        return formatted.sort((a, b) => a.pickupSortTime - b.pickupSortTime);
    }

    function fetchActiveOrders() {
        apiFetch("http://localhost:8080/api/staff/orders")
            .then((data) => setOrders(formatOrders(data)))
            .catch((error) => console.error("Failed to load orders:", error));
    }

    function fetchArchivedOrders() {
        apiFetch("http://localhost:8080/api/staff/orders/archive")
            .then((data) => setArchivedOrders(formatOrders(data)))
            .catch((error) => console.error("Failed to load archive:", error));
    }


    function fetchMenu() {
        apiFetch("http://localhost:8080/api/menu")
            .then((data) => {
                console.log("MENU:", data);
                setMenu(data);
            })
            .catch((error) => console.error("Failed to load menu:", error));
    }

    /**
     * Updates stock by changing itemCount.
     * itemCount 0 means out of stock, and 1 or more means available.
     */
    function updateMenuStock(id, isAvailable, item) {
        const nextOverrides = { ...stockOverrides, [id]: isAvailable };
        const nextItemCount = isAvailable ? Math.max(Number(item.itemCount) || 1, 1) : 0;

        setStockOverrides(nextOverrides);
        localStorage.setItem("stockOverrides", JSON.stringify(nextOverrides));
        setMenu((currentMenu) =>
            currentMenu.map((menuItem) =>
                getMenuItemId(menuItem) === id
                    ? { ...menuItem, itemCount: nextItemCount, isAvailable }
                    : menuItem
            )
        );

        const formData = new FormData();
        formData.append("itemCount", String(nextItemCount));

        apiFetch(`http://localhost:8080/api/menu/${id}`, {
            method: "PUT",
            body: formData,
        })
            .then(() => {
                fetchMenu();
                fetchActiveOrders();
            })
            .catch((error) => {
                console.error("Failed to update menu stock:", error);
            });
    }

    /**
     * Adds a new menu item using the backend menu API.
     */
    function addMenuItem(menuForm) {
        const formData = new FormData();
        formData.append("name", menuForm.name);
        formData.append("description", menuForm.description);
        formData.append("imgUrl", menuForm.imgUrl);
        formData.append("rating", menuForm.rating);
        formData.append("category", menuForm.category);
        formData.append("itemCount", menuForm.itemCount);

        return apiFetch("http://localhost:8080/api/menu", {
            method: "POST",
            body: formData,
        })
            .then(() => {
                fetchMenu();
            })
            .catch((error) => {
                console.error("Failed to add menu item:", error);
                throw error;
            });
    }

    /**
     * Removes a menu item after staff confirms the action.
     */
    function deleteMenuItem(id, name) {
        const shouldDelete = window.confirm(`Remove ${name} from the menu?`);

        if (!shouldDelete) return;

        apiFetch(`http://localhost:8080/api/menu/${id}`, {
            method: "DELETE",
        })
            .then(() => {
                setMenu((currentMenu) =>
                    currentMenu.filter((item) => getMenuItemId(item) !== id)
                );
                fetchMenu();
            })
            .catch((error) => console.error("Failed to delete menu item:", error));
    }


    useEffect(() => {
        if (!isLoggedIn) return;

        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 3000);

        return () => clearInterval(interval);
    }, [isLoggedIn]);


    useEffect(() => {
        if (!isLoggedIn) return;

        if (view === "archive") {
            setActiveTab("all");
            fetchArchivedOrders();
        }

        if (view === "staff") {
            setActiveTab("all");
            fetchActiveOrders();
        }
    }, [isLoggedIn, view]);



    useEffect(() => {
        if (!isLoggedIn) return;
        fetchMenu();
    }, [isLoggedIn]);


    /**
     * Sends the next order status to the backend.
     */
    function updateStatus(id, newStatus) {
        const statusMap = {
            accepted: "ACCEPTED",
            "in-progress": "PREPARING",
            ready: "READY",
            cancelled: "CANCELLED",
            archived: "COLLECTED",
        };


        const backendStatus = statusMap[newStatus];


        apiFetch(`/api/staff/orders/${id}/status?status=${backendStatus}`, {
            method: "PATCH",
        })
            .then(() => {
                fetchActiveOrders();
                if (view === "archive") fetchArchivedOrders();
            })
            .catch((error) => console.error("Failed to update status:", error));
    }

    const currentOrders = view === "archive" ? archivedOrders : orders;

    const filteredOrders =
        activeTab === "all"
            ? currentOrders
            : currentOrders.filter((order) => order.status === activeTab);

    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)}/>;
    }

    return (
        <div className="container">
            <h1 className="header">Whistlestop Coffee Hut</h1>

            <div className="dashboard-layout">
                <DashboardSidebar
                    view={view}
                    activeTab={activeTab}
                    setView={setView}
                    setActiveTab={setActiveTab}
                />

                <div className="dashboard-content">
                    {view === "menu" ? (
                        <MenuControl
                            menu={menu}
                            getMenuItemId={getMenuItemId}
                            isMenuItemAvailable={isMenuItemAvailable}
                            onAddMenuItem={addMenuItem}
                            onDeleteMenuItem={deleteMenuItem}
                            onUpdateMenuStock={updateMenuStock}
                        />
                    ) : (
                        <div className="order-grid">
                            {filteredOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    updateStatus={updateStatus}
                                    isArchive={view === "archive"}
                                    isAllView={view === "staff" && activeTab === "all"}
                                    isOutOfStock={isOutOfStock}
                                    onClick={() => setSelectedOrder(order)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button
                className="logout-btn"
                onClick={() => {
                    localStorage.removeItem("staffToken");
                    setIsLoggedIn(false);
                }}>

                <FiUnlock/> Logout

            </button>

            {selectedOrder && (
                <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)}/>
            )}
        </div>
    );

}


export default App;
