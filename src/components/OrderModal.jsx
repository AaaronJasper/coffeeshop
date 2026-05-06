/**
 * Shows more details for an order when staff clicks a summary card.
 */
export default function OrderModal({ order, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
                <h2>Order {order.displayId || `#${order.id}`}</h2>
                <p>Ordered: {order.orderTime}</p>
                <p>Pickup: {order.pickupTime}</p>
                <p>Status: {order.status}</p>

                <div>
                    {order.items.map((item, index) => (
                        <p key={index}>
                            {item.quantity} x {item.name} ({item.size})
                        </p>
                    ))}
                </div>

                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
