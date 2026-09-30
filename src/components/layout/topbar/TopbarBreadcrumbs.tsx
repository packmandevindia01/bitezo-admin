import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

const getPageTitle = (pathname: string): string => {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Users",
    "/dashboard/user/create": "Users > Create",
    "/dashboard/customers": "Customers",
    "/dashboard/customers/create": "Customers > Create",
    "/dashboard/dealers": "Dealers",
    "/dashboard/employees": "Employees",
    "/dashboard/users-reports": "Reports > User Reports",
    "/dashboard/customers-reports": "Reports > Customer Reports",
    "/dashboard/settings": "Settings",
  };

  if (map[pathname]) return map[pathname];
  if (pathname.includes("/dashboard/customers/edit")) return "Customers > Edit";

  // Auto-generate from path if not in map
  let path = pathname.startsWith("/dashboard/")
    ? pathname.replace("/dashboard/", "")
    : pathname.replace(/^\//, "");
  const parts = path.split("/");
  if (!parts[0]) return "Dashboard";

  const moduleName = parts[0]
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (parts.length >= 2) {
    const action = parts[1].toLowerCase();
    if (action === "create" || action === "new" || action === "add") {
      return `${moduleName} > Create`;
    }
    if (action === "edit") {
      return `${moduleName} > Edit`;
    }
  }

  return moduleName;
};

const TopbarBreadcrumbs = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="hidden text-gray-400 sm:block">Bitezo</span>
      {pageTitle.split(" > ").map((segment, index, arr) => {
        const isPrimary = index === 0;
        const isLast = index === arr.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5 font-semibold">
            <ChevronRight size={13} className="text-gray-300" />
            <span
              className={`
                rounded-md transition-all duration-200
                ${
                  isPrimary
                    ? "bg-[#49293e] px-3 py-1 text-[12px] uppercase tracking-wider text-white shadow-md shadow-[#49293e]/20"
                    : isLast
                      ? "text-gray-700 ml-1 text-sm font-medium"
                      : "text-gray-400 ml-1 text-sm font-medium"
                }
              `}
            >
              {segment}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TopbarBreadcrumbs;
