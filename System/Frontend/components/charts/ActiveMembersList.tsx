'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

interface ActiveMemberData {
  userId: string;
  fullName: string;
  email: string;
  bookingCount: number;
  workshopCount: number;
  lastActivity: string;
  activityScore: number;
}

interface ActiveMembersListProps {
  data: ActiveMemberData[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function ActiveMembersList({ 
  data, 
  loading = false,
  title = "Most Active Members", 
  description = "Top members by activity score" 
}: ActiveMembersListProps) {
  const formatLastActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityBadgeColor = (score: number) => {
    if (score >= 30) return 'bg-green-500';
    if (score >= 15) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Loading member activity data...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No active members found
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((member, index) => (
              <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/avatars/${member.userId}.jpg`} />
                      <AvatarFallback>
                        {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {member.bookingCount} bookings
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {member.workshopCount} workshops
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatLastActivity(member.lastActivity)}
                  </div>
                  <Badge className={`${getActivityBadgeColor(member.activityScore)} text-white`}>
                    Score: {member.activityScore.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
