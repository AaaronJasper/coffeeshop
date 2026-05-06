import { useState } from "react";

const emptyMenuForm = {
    name: "",
    description: "",
    imgUrl: "",
    rating: "0.0",
    category: "",
    itemCount: "1",
};

/**
 * Shows the menu management page for staff.
 * Staff can add menu items, delete items, and mark items as out of stock.
 */
export default function MenuControl({
    menu,
    getMenuItemId,
    isMenuItemAvailable,
    onAddMenuItem,
    onDeleteMenuItem,
    onUpdateMenuStock,
}) {
    const [showAddMenuForm, setShowAddMenuForm] = useState(false);
    const [menuForm, setMenuForm] = useState(emptyMenuForm);

    /**
     * Updates one field in the add item form.
     */
    function updateMenuForm(field, value) {
        setMenuForm((currentForm) => ({ ...currentForm, [field]: value }));
    }

    /**
     * Sends the new item to App, then clears and closes the form.
     */
    function handleSubmit(event) {
        event.preventDefault();

        onAddMenuItem(menuForm).then(() => {
            setMenuForm(emptyMenuForm);
            setShowAddMenuForm(false);
        });
    }

    return (
        <div className="menu-control">
            <div className="menu-control-header">
                <h2>Menu Control</h2>
                <button
                    className="add-menu-btn"
                    onClick={() => setShowAddMenuForm((isOpen) => !isOpen)}
                >
                    {showAddMenuForm ? "Close" : "Add Item"}
                </button>
            </div>

            {showAddMenuForm && (
                <form className="add-menu-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={menuForm.name}
                        onChange={(event) => updateMenuForm("name", event.target.value)}
                        maxLength="200"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={menuForm.category}
                        onChange={(event) => updateMenuForm("category", event.target.value)}
                        maxLength="100"
                        required
                    />
                    <input
                        type="url"
                        placeholder="Image URL"
                        value={menuForm.imgUrl}
                        onChange={(event) => updateMenuForm("imgUrl", event.target.value)}
                        maxLength="2048"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Rating"
                        min="0"
                        max="5"
                        step="0.1"
                        value={menuForm.rating}
                        onChange={(event) => updateMenuForm("rating", event.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Item count"
                        min="0"
                        value={menuForm.itemCount}
                        onChange={(event) => updateMenuForm("itemCount", event.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={menuForm.description}
                        onChange={(event) => updateMenuForm("description", event.target.value)}
                        maxLength="2000"
                        required
                    />
                    <button type="submit" className="save-menu-btn">
                        Save Item
                    </button>
                </form>
            )}

            {menu.map((item) => {
                const itemId = getMenuItemId(item);
                const available = isMenuItemAvailable(item);

                return (
                    <div className="menu-control-row" key={itemId}>
                        <div>
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                        </div>

                        <div className="menu-row-actions">
                            {!available ? (
                                <button
                                    className="restock-btn"
                                    onClick={() => onUpdateMenuStock(itemId, true, item)}
                                >
                                    Restock
                                </button>
                            ) : (
                                <button
                                    className="out-of-stock-btn"
                                    onClick={() => onUpdateMenuStock(itemId, false, item)}
                                >
                                    Mark Out of Stock
                                </button>
                            )}
                            <button
                                className="delete-menu-btn"
                                onClick={() => onDeleteMenuItem(itemId, item.name)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
