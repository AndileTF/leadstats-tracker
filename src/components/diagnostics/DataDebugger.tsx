
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Database, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DataDebuggerProps {
  title: string;
  data: any[] | null;
  error: string | null;
  isLoading: boolean;
  onRefresh?: () => void;
  tableName: string;
}

export const DataDebugger = ({
  title,
  data,
  error,
  isLoading,
  onRefresh,
  tableName,
}: DataDebuggerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              {title}
              <Badge variant={error ? "destructive" : data && data.length > 0 ? "default" : "outline"}>
                {error ? "Error" : isLoading ? "Loading..." : data && data.length > 0 ? `${data.length} records` : "No data"}
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button size="sm" variant="ghost" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
              <Button size="sm" variant="ghost">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {error ? (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                <p className="font-medium">Error fetching data from {tableName}</p>
                <p className="mt-1">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-24">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : data && data.length > 0 ? (
              <div className="bg-muted/30 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(data[0], null, 2)}</pre>
                {data.length > 1 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    ...and {data.length - 1} more records
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground">
                No data available from {tableName} table
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
