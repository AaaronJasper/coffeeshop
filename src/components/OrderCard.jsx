/**
 * Displays one order on the staff dashboard.
 * Staff can update the order status from this card.
 */
export default function OrderCard({ order, updateStatus, isArchive, isAllView, onClick, isOutOfStock }) {
    /**
     * Stops the card click event and updates the order status.
     */
    function handleButtonClick(event, status) {
        event.stopPropagation();
        updateStatus(order.id, status);
    }

    return (
        <div
            className={`order-card ${isAllView ? "summary" : ""}`}
            onClick={isAllView ? onClick : undefined}
        >
            <div className="order-card-header">
                <h3>Order {order.displayId || `#${order.id}`}</h3>
                <div className="order-times">
                    <span>Ordered {order.orderTime}</span>
                    <span>Pickup {order.pickupTime}</span>
                </div>
            </div>

            <div className={`status-badge ${order.status}`}>{order.status}</div>

            {!isAllView && (
                <div className="items-list">
                    {order.items.map((item, index) => (
                        <p key={index}>
                            {item.quantity} x {item.name} ({item.size})
                        </p>
                    ))}
                </div>
            )}

            {!isAllView && order.items.some((item) => isOutOfStock(item.name)) && (
                <p className="out-of-stock">
                     Out of Stock
                </p>
            )}

            <p className="item-count">{order.items.length} items</p>

            {!isAllView && !isArchive && (
                <>
                    <div className="card-actions">


                        {order.status === "new" && (
                            <button onClick={(event) => handleButtonClick(event, "accepted")}>
                                Accept order
                            </button>
                        )}

                        {(order.backendStatus === "ACCEPTED") && (
                            <button onClick={(event) => handleButtonClick(event, "in-progress")}>
                                Start preparing
                            </button>
                        )}

                        {order.backendStatus === "PREPARING" && (
                            <button onClick={(event) => handleButtonClick(event, "ready")}>
                                Mark as ready
                            </button>
                        )}

                        {order.backendStatus === "READY" && (
                            <button onClick={(event) => handleButtonClick(event, "archived")}>
                                Collect
                            </button>
                        )}
                    </div>

                    {order.backendStatus !== "CANCELLED" && (
                        <button
                            className="cancel-btn"
                            onClick={(event) => handleButtonClick(event, "cancelled")}
                        >
                            Cancel
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
