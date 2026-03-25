'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityData {
  date: string;
  activeMembers: number;
  newMembers: number;
  suspendedMembers: number;
  totalBookings: number;
}

interface MemberActivityChartProps {
  data: ActivityData[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function MemberActivityChart({ data, loading = false, title = "Member Activity Trends", description = "Overview of member activity over time" }: MemberActivityChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading activity data...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No activity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value: any, name: string) => {
                  const formattedName = name.replace(/([A-Z])/g, ' $1').trim();
                  return [value, formattedName];
                }}
              />
              <Legend 
                formatter={(value) => value.replace(/([A-Z])/g, ' $1').trim()}
              />
              <Line 
                type="monotone" 
                dataKey="activeMembers" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Active Members"
              />
              <Line 
                type="monotone" 
                dataKey="newMembers" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="New Members"
              />
              <Line 
                type="monotone" 
                dataKey="suspendedMembers" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Suspended Members"
              />
              <Line 
                type="monotone" 
                dataKey="totalBookings" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Total Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
