'use client';

import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Trans } from '@kit/ui/trans';

// TODO: Replace with React Query
const mockTeamMembers: {
  id: string;
  name: string;
  email: string;
  initials: string;
  image: string | null;
  role: string;
  team: string;
  status: string;
  currentAbsence: { type: string; endDate: string } | null;
  nextAbsence: { startDate: string; type: string } | null;
}[] = [];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
};

function TeamMembersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Next Absence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-1 h-3 w-36" />
                </div>
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TeamMembersList() {
  // TODO: Replace with React Query
  const isLoading = false;
  const members = mockTeamMembers;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <TeamMembersTableSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Group by team
  const teams = members.reduce(
    (acc, member) => {
      if (!acc[member.team]) {
        acc[member.team] = [];
      }
      acc[member.team]!.push(member);
      return acc;
    },
    {} as Record<string, typeof members>
  );

  return (
    <div className="space-y-6">
      {Object.entries(teams).map(([teamName, teamMembers]) => (
        <Card key={teamName}>
          <CardHeader>
            <CardTitle className="text-lg">
              {teamName}
              <Badge variant="outline" className="ml-2">
                {teamMembers.length} members
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Absence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.image ?? undefined} />
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.status === 'absent' ? (
                        <Badge variant="secondary">
                          <Trans i18nKey={`leave:types.${member.currentAbsence?.type}`} />
                          {' until '}
                          {member.currentAbsence?.endDate &&
                            format(new Date(member.currentAbsence.endDate), 'MMM d')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600">
                          Available
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {member.nextAbsence ? (
                        <>
                          <Trans i18nKey={`leave:types.${member.nextAbsence.type}`} />
                          {' from '}
                          {format(new Date(member.nextAbsence.startDate), 'MMM d, yyyy')}
                        </>
                      ) : (
                        'None scheduled'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
