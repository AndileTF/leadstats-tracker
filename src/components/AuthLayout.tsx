
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
