import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  // Sidebar open by default on desktop, closed on mobile (matching client-bitezo)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR DRAWER */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[280px] max-w-[85vw] transform transition-transform duration-300 md:w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
        />
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;