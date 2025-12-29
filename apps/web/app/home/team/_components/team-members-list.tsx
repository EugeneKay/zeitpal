'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { format } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
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

const UNASSIGNED_TEAM = '__unassigned__';

interface TeamMemberAvailability {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  teamNames: string[];
  currentAbsence: { type: string; endDate: string } | null;
  nextAbsence: { startDate: string; type: string } | null;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  hr: 'HR',
  employee: 'Employee',
  member: 'Member',
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return email ? email[0]?.toUpperCase() ?? '?' : '?';
}

function TeamMembersTableSkeleton() {
  return (
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
  const [members, setMembers] = useState<TeamMemberAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/team-availability');
      if (!response.ok) {
        throw new Error('Failed to load team members');
      }
      const data = await response.json();
      if (isMountedRef.current) {
        setMembers(data.data || []);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to load team members'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    const handleTeamsUpdated = () => {
      loadMembers();
    };

    window.addEventListener('teams:updated', handleTeamsUpdated);

    return () => {
      window.removeEventListener('teams:updated', handleTeamsUpdated);
    };
  }, [loadMembers]);

  const teamEntries = useMemo<Array<[string, TeamMemberAvailability[]]>>(() => {
    if (members.length === 0) {
      return [];
    }

    const grouped = members.reduce(
      (acc, member) => {
        const teamsForMember =
          member.teamNames.length > 0 ? member.teamNames : [UNASSIGNED_TEAM];

        teamsForMember.forEach((teamName) => {
          if (!acc[teamName]) {
            acc[teamName] = [];
          }
          acc[teamName]!.push(member);
        });

        return acc;
      },
      {} as Record<string, TeamMemberAvailability[]>
    );

    return Object.entries(grouped)
      .map(
        ([teamName, teamMembers]) =>
          [
            teamName,
            [...teamMembers].sort((a, b) => {
              const aLabel = a.user.name || a.user.email;
              const bLabel = b.user.name || b.user.email;
              return aLabel.localeCompare(bLabel);
            }),
          ] as [string, TeamMemberAvailability[]]
      )
      .sort(([a], [b]) => {
        if (a === UNASSIGNED_TEAM) return 1;
        if (b === UNASSIGNED_TEAM) return -1;
        return a.localeCompare(b);
      });
  }, [members]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <TeamMembersTableSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={loadMembers}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No team members found yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {teamEntries.map(([teamName, teamMembers]) => {
        const teamLabel =
          teamName === UNASSIGNED_TEAM ? 'Unassigned' : teamName;

        return (
          <Card key={teamName}>
            <CardHeader>
              <CardTitle className="text-lg">
                {teamLabel}
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
                    <TableRow key={`${teamName}-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={member.user.avatarUrl ?? undefined}
                            />
                            <AvatarFallback>
                              {getInitials(member.user.name, member.user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.name || member.user.email}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {roleLabels[member.role] ?? member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.currentAbsence ? (
                          <Badge variant="secondary">
                            <Trans
                              i18nKey={`leave:types.${member.currentAbsence?.type}`}
                            />
                            {' until '}
                            {member.currentAbsence?.endDate &&
                              format(
                                new Date(member.currentAbsence.endDate),
                                'MMM d'
                              )}
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
                            <Trans
                              i18nKey={`leave:types.${member.nextAbsence.type}`}
                            />
                            {' from '}
                            {format(
                              new Date(member.nextAbsence.startDate),
                              'MMM d, yyyy'
                            )}
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
        );
      })}
    </div>
  );
}
