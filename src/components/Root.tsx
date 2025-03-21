
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";

const Root = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
