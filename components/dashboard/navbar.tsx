import { NavbarRoutes } from "../navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = () => {
  return (
    <div className="p-4 h-full flex items-center">
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  );
};
