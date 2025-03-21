
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";

import Root from '@/components/Root';
import Index from '@/pages/Index';
import AdminDashboard from '@/pages/AdminDashboard';
import TeamOverview from '@/pages/team-overview';
import NotFound from '@/pages/NotFound';
import TeamLeadDashboard from '@/pages/team-lead-dashboard/TeamLeadDashboard';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'admin-dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'team-overview',
        element: <TeamOverview />,
      },
      {
        path: 'team-lead-dashboard',
        element: <TeamLeadDashboard />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
    errorElement: <NotFound />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
