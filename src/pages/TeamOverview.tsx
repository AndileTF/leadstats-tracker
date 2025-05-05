
import AuthLayout from "@/components/AuthLayout";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";
import { AgentsList } from "@/components/dashboard/AgentsList";

const TeamOverview = () => {
  return (
    <AuthLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TeamOverviewHeader />
        <div className="mt-8">
          <TeamLeadTabs />
        </div>
        <div className="mt-8">
          <AgentsList />
        </div>
      </div>
    </AuthLayout>
  );
};

export default TeamOverview;
