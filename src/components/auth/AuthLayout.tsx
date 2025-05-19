
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center" 
         style={{ backgroundImage: "url('/lovable-uploads/3d9784ab-f5de-4e43-94ff-a794f6978026.png')" }}>
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg backdrop-blur-md bg-black/50 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            <span className="liquid-text">LIQUID</span> Technologies
          </h2>
          <p className="mt-2 text-sm text-gray-300">Team Lead Dashboard</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
