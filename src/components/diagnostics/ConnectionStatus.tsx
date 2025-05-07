
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDatabaseConnection } from "@/hooks/use-supabase-data";
import { AlertCircle, CheckCircle2, Database, Loader2, RefreshCw } from "lucide-react";

export function ConnectionStatus() {
  const { isConnected, isChecking, connectionError, checkConnection } = useDatabaseConnection();

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Database className="h-5 w-5" />
          Database Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isChecking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span>Checking connection...</span>
            </>
          ) : isConnected === null ? (
            <>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <span>Connection status unknown</span>
            </>
          ) : isConnected ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-600">Connected to Supabase database</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">
                Connection failed
              </span>
            </>
          )}
        </div>

        {connectionError && (
          <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {connectionError}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Check Connection
        </Button>
      </CardFooter>
    </Card>
  );
}
