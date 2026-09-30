import { Menu } from "lucide-react";
import TopbarBreadcrumbs from "./topbar/TopbarBreadcrumbs";
import TopbarProfileMenu from "./topbar/TopbarProfileMenu";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const username = user?.userName ?? "Admin";

  return (
    <div
      className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm md:px-6"
      style={{ height: "50px" }}
    >
      {/* LEFT — hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 transition hover:bg-gray-100 text-gray-600"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <TopbarBreadcrumbs />
      </div>

      {/* RIGHT — profile dropdown */}
      <div className="flex items-center gap-3">
        <TopbarProfileMenu username={username} />
      </div>
    </div>
  );
};

export default Topbar;