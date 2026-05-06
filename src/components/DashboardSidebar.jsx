/**
 * Sidebar used by staff to move between the main dashboard pages.
 * It also shows which tab is currently selected.
 */
export default function DashboardSidebar({ view, activeTab, setView, setActiveTab }) {
    /**
     * Changes both the main page and the selected tab.
     */
    function openTab(nextView, nextTab) {
        setView(nextView);
        setActiveTab(nextTab);
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <p className="sidebar-title">Staff Dashboard</p>
                <button
                    onClick={() => openTab("staff", "all")}
                    className={view === "staff" && activeTab === "all" ? "active" : ""}
                >
                    All
                </button>
                <button
                    onClick={() => openTab("staff", "new")}
                    className={view === "staff" && activeTab === "new" ? "active" : ""}
                >
                    New
                </button>
                <button
                    onClick={() => openTab("staff", "accepted")}
                    className={view === "staff" && activeTab === "accepted" ? "active" : ""}
                >
                    Accepted
                </button>
                <button
                    onClick={() => openTab("staff", "in-progress")}
                    className={view === "staff" && activeTab === "in-progress" ? "active" : ""}
                >
                    In Progress
                </button>
                <button
                    onClick={() => openTab("staff", "ready")}
                    className={view === "staff" && activeTab === "ready" ? "active" : ""}
                >
                    Ready for Collection
                </button>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-title">Archive Dashboard</p>
                <button
                    onClick={() => openTab("archive", "all")}
                    className={view === "archive" && activeTab === "all" ? "active" : ""}
                >
                    All
                </button>
                <button
                    onClick={() => openTab("archive", "completed")}
                    className={view === "archive" && activeTab === "completed" ? "active" : ""}
                >
                    Completed
                </button>
                <button
                    onClick={() => openTab("archive", "cancelled")}
                    className={view === "archive" && activeTab === "cancelled" ? "active" : ""}
                >
                    Cancelled
                </button>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-title">Menu Control</p>
                <button
                    onClick={() => setView("menu")}
                    className={view === "menu" ? "active" : ""}
                >
                    Menu Items
                </button>
            </div>
        </aside>
    );
}
