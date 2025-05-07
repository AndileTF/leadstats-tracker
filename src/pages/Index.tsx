import TeamLeadDashboard from './team-lead-dashboard/TeamLeadDashboard';
import { ConnectionStatus } from "@/components/diagnostics/ConnectionStatus";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Team Lead Dashboard System</h1>
        
        <ConnectionStatus />
        
        <TeamLeadDashboard />
      </div>
    </div>
  );
};

export default Index;
