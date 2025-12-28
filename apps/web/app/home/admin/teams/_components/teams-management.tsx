'use client';

import { useState } from 'react';

import { MoreHorizontal, Plus, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

// TODO: Replace with React Query
const mockTeams: {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  manager: { id: string; name: string; avatarUrl: string | null } | null;
  members: { id: string; name: string; avatarUrl: string | null; role: string }[];
}[] = [];

const mockMembers: { id: string; name: string }[] = [];

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TeamsManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamManager, setTeamManager] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTeam = async () => {
    setIsCreating(true);
    try {
      // TODO: Implement API call
      console.log('Creating team:', { name: teamName, description: teamDescription, managerId: teamManager });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCreateDialogOpen(false);
      setTeamName('');
      setTeamDescription('');
      setTeamManager('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    // TODO: Implement API call
    console.log('Deleting team:', teamId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {mockTeams.length} <Trans i18nKey="admin:teams.teamsCount" />
          </h2>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              <Trans i18nKey="admin:teams.createTeam" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="admin:teams.createDialog.title" />
              </DialogTitle>
              <DialogDescription>
                <Trans i18nKey="admin:teams.createDialog.description" />
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <Trans i18nKey="admin:teams.createDialog.name" />
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Engineering"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">
                  <Trans i18nKey="admin:teams.createDialog.description" />
                </Label>
                <Textarea
                  id="description"
                  placeholder="Team description..."
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="manager">
                  <Trans i18nKey="admin:teams.createDialog.manager" />
                </Label>
                <Select value={teamManager} onValueChange={setTeamManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                <Trans i18nKey="common:cancel" />
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={!teamName || isCreating}
              >
                {isCreating ? (
                  <Trans i18nKey="admin:teams.createDialog.creating" />
                ) : (
                  <Trans i18nKey="admin:teams.createDialog.create" />
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Trans i18nKey="admin:teams.actions.edit" />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trans i18nKey="admin:teams.actions.addMembers" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trans i18nKey="admin:teams.actions.delete" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Manager */}
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    <Trans i18nKey="admin:teams.manager" />
                  </p>
                  {team.manager ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={team.manager.avatarUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(team.manager.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{team.manager.name}</span>
                    </div>
                  ) : (
                    <Badge variant="outline">
                      <Trans i18nKey="admin:teams.noManager" />
                    </Badge>
                  )}
                </div>

                {/* Members */}
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">
                    <Trans i18nKey="admin:teams.members" />
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 4).map((member) => (
                        <Avatar
                          key={member.id}
                          className="border-background h-6 w-6 border-2"
                        >
                          <AvatarImage src={member.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Badge variant="secondary" className="ml-1">
                      <Users className="mr-1 h-3 w-3" />
                      {team.memberCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
