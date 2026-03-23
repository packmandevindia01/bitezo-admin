import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">

  {/* Sidebar */}
  <div
    className={`fixed md:static z-40 inset-y-0 left-0 transform 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 transition-transform duration-300`}
  >
    <Sidebar 
  isOpen={sidebarOpen} 
  onClose={() => setSidebarOpen(false)} 
/>
  </div>

  {/* Overlay */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 bg-black/30 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* RIGHT SIDE */}
  <div className="flex flex-col flex-1 min-w-0">

    {/* ✅ FIX: REMOVE background from parent */}
    <Topbar toggleSidebar={toggleSidebar} />

    {/* ✅ Apply background ONLY here */}
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
      <Outlet />
    </main>

  </div>
</div>
  );
};

export default MainLayout;