import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AgentPerformanceFilters } from '@/types/agentPerformance';
import { TeamLead } from '@/types/teamLead';

interface AgentPerformanceFiltersProps {
  filters: AgentPerformanceFilters;
  onFiltersChange: (filters: AgentPerformanceFilters) => void;
  teamLeads: TeamLead[];
}

export const AgentPerformanceFiltersComponent = ({ 
  filters, 
  onFiltersChange, 
  teamLeads 
}: AgentPerformanceFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof AgentPerformanceFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (key: 'startDate' | 'endDate', value: string) => {
    const newDateRange = { ...localFilters.dateRange, [key]: value };
    handleFilterChange('dateRange', newDateRange);
  };

  const toggleSortOrder = () => {
    const newOrder = localFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange('sortOrder', newOrder);
  };

  const clearFilters = () => {
    const clearedFilters: AgentPerformanceFilters = {
      search: '',
      teamLeadId: undefined,
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      sortBy: 'efficiency_score',
      sortOrder: 'desc',
      minCalls: undefined,
      minEmails: undefined,
      showTopPerformersOnly: false
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Performance Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Team Lead Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Agents</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by agent name..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Team Lead</Label>
            <Select
              value={localFilters.teamLeadId || 'all'}
              onValueChange={(value) => 
                handleFilterChange('teamLeadId', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Leads</SelectItem>
                {teamLeads.map(tl => (
                  <SelectItem key={tl.id} value={tl.id}>
                    {tl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Minimum Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minCalls">Minimum Calls</Label>
            <Input
              id="minCalls"
              type="number"
              placeholder="e.g., 50"
              value={localFilters.minCalls || ''}
              onChange={(e) => 
                handleFilterChange('minCalls', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minEmails">Minimum Emails</Label>
            <Input
              id="minEmails"
              type="number"
              placeholder="e.g., 20"
              value={localFilters.minEmails || ''}
              onChange={(e) => 
                handleFilterChange('minEmails', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        {/* Sort and Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Agent Name</SelectItem>
                <SelectItem value="calls">Total Calls</SelectItem>
                <SelectItem value="emails">Total Emails</SelectItem>
                <SelectItem value="efficiency_score">Efficiency Score</SelectItem>
                <SelectItem value="customer_satisfaction">Customer Satisfaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
          >
            {localFilters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            {localFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="topPerformers"
              checked={localFilters.showTopPerformersOnly || false}
              onCheckedChange={(checked) => handleFilterChange('showTopPerformersOnly', checked)}
            />
            <Label htmlFor="topPerformers" className="text-sm">
              Top Performers Only
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};