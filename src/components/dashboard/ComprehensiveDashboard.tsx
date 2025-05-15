
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCalls,
  useEmails,
  useLiveChat,
  useEscalations,
  useQAAssessments,
  useSurveyTickets,
  useAgents,
} from "@/hooks/use-supabase-data";
import { useDateRange } from "@/context/DateContext";
import { format } from "date-fns";

interface ComprehensiveDashboardProps {
  teamLeadId: string | null;
}

export const ComprehensiveDashboard = ({ teamLeadId }: ComprehensiveDashboardProps) => {
  const { toast } = useToast();
  const { dateRange } = useDateRange();
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Format dates for display
  const formattedStartDate = dateRange.startDate 
    ? format(new Date(dateRange.startDate), 'MMM dd, yyyy')
    : 'Not set';
    
  const formattedEndDate = dateRange.endDate 
    ? format(new Date(dateRange.endDate), 'MMM dd, yyyy')
    : 'Not set';

  // Fetch data from all tables using the custom hooks
  const {
    data: calls,
    isLoading: isLoadingCalls,
    error: callsError,
    refetch: refetchCalls,
  } = useCalls(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: emails,
    isLoading: isLoadingEmails,
    error: emailsError,
    refetch: refetchEmails,
  } = useEmails(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: liveChats,
    isLoading: isLoadingLiveChats,
    error: liveChatsError,
    refetch: refetchLiveChats,
  } = useLiveChat(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: escalations,
    isLoading: isLoadingEscalations,
    error: escalationsError,
    refetch: refetchEscalations,
  } = useEscalations(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: qaAssessments,
    isLoading: isLoadingQAAssessments,
    error: qaAssessmentsError,
    refetch: refetchQAAssessments,
  } = useQAAssessments(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: surveyTickets,
    isLoading: isLoadingSurveyTickets,
    error: surveyTicketsError,
    refetch: refetchSurveyTickets,
  } = useSurveyTickets(teamLeadId, dateRange.startDate, dateRange.endDate, !!teamLeadId);

  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
    refetch: refetchAgents,
  } = useAgents(teamLeadId, !!teamLeadId);

  // Determine if any data is loading
  useEffect(() => {
    setIsDataLoading(
      isLoadingCalls ||
      isLoadingEmails ||
      isLoadingLiveChats ||
      isLoadingEscalations ||
      isLoadingQAAssessments ||
      isLoadingSurveyTickets ||
      isLoadingAgents
    );
  }, [
    isLoadingCalls,
    isLoadingEmails,
    isLoadingLiveChats,
    isLoadingEscalations,
    isLoadingQAAssessments,
    isLoadingSurveyTickets,
    isLoadingAgents,
  ]);

  // Handle refresh of all data
  const handleRefreshAllData = () => {
    if (teamLeadId) {
      refetchCalls();
      refetchEmails();
      refetchLiveChats();
      refetchEscalations();
      refetchQAAssessments();
      refetchSurveyTickets();
      refetchAgents();
      
      toast({
        title: "Refreshing Data",
        description: "Fetching the latest data from all tables..."
      });
    } else {
      toast({
        title: "Error",
        description: "No team lead selected",
        variant: "destructive"
      });
    }
  };

  // Show error if any table has an error
  const hasErrors = callsError || emailsError || liveChatsError || 
                   escalationsError || qaAssessmentsError || 
                   surveyTicketsError || agentsError;
                   
  // Check if no data is available
  const noData = !teamLeadId || 
    (calls?.length === 0 && 
     emails?.length === 0 && 
     liveChats?.length === 0 && 
     escalations?.length === 0 && 
     qaAssessments?.length === 0 && 
     surveyTickets?.length === 0 && 
     agents?.length === 0);

  if (!teamLeadId) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">Please select a team lead to view their data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasErrors) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="bg-destructive/10 border border-destructive rounded-md p-4">
            <p className="text-destructive font-medium">Error loading data</p>
            <p className="text-destructive/70 mt-1 text-sm">
              There was an error loading data from one or more tables. Please try again.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRefreshAllData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Comprehensive Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Showing data from {formattedStartDate} to {formattedEndDate}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshAllData}
          disabled={isDataLoading}
        >
          {isDataLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh All Data
        </Button>
      </div>

      {isDataLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div>
      ) : noData ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-muted-foreground mt-1">
                There is no data available for the selected team lead in the current date range.
              </p>
              <Button variant="outline" className="mt-4" onClick={handleRefreshAllData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Agents Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Agent Assignments</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchAgents()}
                  disabled={isLoadingAgents}
                >
                  {isLoadingAgents ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agents && agents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.group_name}</TableCell>
                        <TableCell>{format(new Date(agent.start_date), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No agents assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Calls Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calls</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchCalls()}
                  disabled={isLoadingCalls}
                >
                  {isLoadingCalls ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calls && calls.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Call Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call, index) => (
                      <TableRow key={`call-${index}-${call.Date}`}>
                        <TableCell>{format(new Date(call.Date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{call.Name}</TableCell>
                        <TableCell>{call.call_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No call data available</p>
              )}
            </CardContent>
          </Card>

          {/* Emails Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Emails</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchEmails()}
                  disabled={isLoadingEmails}
                >
                  {isLoadingEmails ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emails && emails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email, index) => (
                      <TableRow key={`email-${index}-${email.Date}`}>
                        <TableCell>{format(new Date(email.Date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{email.Name}</TableCell>
                        <TableCell>{email.email_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No email data available</p>
              )}
            </CardContent>
          </Card>

          {/* Live Chat Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Chat</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchLiveChats()}
                  disabled={isLoadingLiveChats}
                >
                  {isLoadingLiveChats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveChats && liveChats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Chat Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveChats.map((chat, index) => (
                      <TableRow key={`chat-${index}-${chat.Date}`}>
                        <TableCell>{format(new Date(chat.Date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{chat.Name}</TableCell>
                        <TableCell>{chat.chat_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No live chat data available</p>
              )}
            </CardContent>
          </Card>

          {/* Escalations Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Escalations</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchEscalations()}
                  disabled={isLoadingEscalations}
                >
                  {isLoadingEscalations ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {escalations && escalations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Escalation Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escalations.map((escalation, index) => (
                      <TableRow key={`escalation-${index}-${escalation.Date}`}>
                        <TableCell>{format(new Date(escalation.Date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{escalation.Name}</TableCell>
                        <TableCell>{escalation.escalation_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No escalation data available</p>
              )}
            </CardContent>
          </Card>

          {/* QA Assessments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>QA Assessments</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchQAAssessments()}
                  disabled={isLoadingQAAssessments}
                >
                  {isLoadingQAAssessments ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qaAssessments && qaAssessments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Assessor</TableHead>
                      <TableHead>Assessment Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qaAssessments.map((qa, index) => (
                      <TableRow key={`qa-${index}-${qa.Date}`}>
                        <TableCell>{format(new Date(qa.Date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{qa.Assessor}</TableCell>
                        <TableCell>{qa.assessment_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No QA assessment data available</p>
              )}
            </CardContent>
          </Card>

          {/* Survey Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>After Call Survey Tickets</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchSurveyTickets()}
                  disabled={isLoadingSurveyTickets}
                >
                  {isLoadingSurveyTickets ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {surveyTickets && surveyTickets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Ticket Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveyTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{format(new Date(ticket.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{ticket.ticket_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No survey ticket data available</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
