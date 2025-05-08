
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useDatabaseConnection } from "@/hooks/use-supabase-data";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export const ConnectionStatus = () => {
  const { isConnected, isChecking, connectionError, checkConnection } = useDatabaseConnection();
  const [showStatus, setShowStatus] = useState(true);
  
  useEffect(() => {
    // Auto-hide successful connection status after 10 seconds
    if (isConnected && !connectionError) {
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, connectionError]);
  
  const handleRetry = async () => {
    const success = await checkConnection();
    if (success) {
      toast({
        title: "Connection Established",
        description: "Successfully connected to the database.",
      });
    }
  };
  
  if (!showStatus && isConnected && !connectionError) {
    return null;
  }
  
  if (isChecking) {
    return (
      <Alert variant="default" className="mb-6 bg-slate-100 dark:bg-slate-800">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        <AlertTitle>Checking Database Connection</AlertTitle>
        <AlertDescription>
          Connecting to Supabase database...
        </AlertDescription>
      </Alert>
    );
  }
  
  if (connectionError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <p>{connectionError}</p>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={isChecking}
              className="mt-2"
            >
              {isChecking && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Retry Connection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isConnected) {
    return (
      <Alert variant="default" className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <AlertTitle>Connected to Database</AlertTitle>
        <AlertDescription>
          Connection to Supabase database established successfully.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="default" className="mb-6 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      <AlertTitle>Connection Status Unknown</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>Connection status to the database could not be determined.</p>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            disabled={isChecking}
            className="mt-2 border-amber-300 dark:border-amber-700"
          >
            {isChecking && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Check Connection
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
