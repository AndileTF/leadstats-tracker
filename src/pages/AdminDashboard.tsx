
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team and organization settings.
        </p>
      </header>
      
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <p>This is a placeholder for the admin dashboard content.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
