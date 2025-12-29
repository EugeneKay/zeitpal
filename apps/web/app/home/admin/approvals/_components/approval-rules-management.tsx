'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowUpDown,
  Edit2,
  Plus,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { Switch } from '@kit/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

interface ApprovalRule {
  id: string;
  name: string;
  conditions: {
    leaveTypes?: string[];
    minDays?: number;
    maxDays?: number;
  };
  approverType: string;
  approverUserId: string | null;
  approverName: string | null;
  approverEmail: string | null;
  level: number;
  priority: number;
  isActive: boolean;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

const approvalRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  approverType: z.enum([
    'team_lead',
    'manager',
    'hr',
    'specific_user',
    'any_admin',
  ]),
  approverUserId: z.string().nullable().optional(),
  level: z.coerce.number().min(1).max(5),
  priority: z.coerce.number().min(0).max(100),
  minDays: z.coerce.number().min(0).nullable().optional(),
  maxDays: z.coerce.number().min(0).nullable().optional(),
  isActive: z.boolean(),
});

type ApprovalRuleFormData = z.infer<typeof approvalRuleSchema>;

const APPROVER_TYPE_LABELS: Record<string, string> = {
  team_lead: 'Team Lead',
  manager: 'Manager',
  hr: 'HR',
  specific_user: 'Specific User',
  any_admin: 'Any Admin',
};

const APPROVER_TYPE_ICONS: Record<string, typeof Shield> = {
  team_lead: Users,
  manager: Shield,
  hr: User,
  specific_user: User,
  any_admin: Shield,
};

export function ApprovalRulesManagement() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<ApprovalRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApprovalRuleFormData>({
    resolver: zodResolver(approvalRuleSchema),
    defaultValues: {
      name: '',
      approverType: 'manager',
      approverUserId: null,
      level: 1,
      priority: 0,
      minDays: null,
      maxDays: null,
      isActive: true,
    },
  });

  const approverType = form.watch('approverType');

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/approval-rules');
      if (!response.ok) {
        throw new Error('Failed to fetch approval rules');
      }
      const data = await response.json();
      setRules(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load approval rules'
      );
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.data || []);
    } catch {
      // Silently fail - we'll just not show the specific user dropdown
    }
  };

  useEffect(() => {
    Promise.all([fetchRules(), fetchMembers()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  const openCreateDialog = () => {
    setEditingRule(null);
    form.reset({
      name: '',
      approverType: 'manager',
      approverUserId: null,
      level: 1,
      priority: 0,
      minDays: null,
      maxDays: null,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: ApprovalRule) => {
    setEditingRule(rule);
    form.reset({
      name: rule.name,
      approverType: rule.approverType as ApprovalRuleFormData['approverType'],
      approverUserId: rule.approverUserId,
      level: rule.level,
      priority: rule.priority,
      minDays: rule.conditions.minDays ?? null,
      maxDays: rule.conditions.maxDays ?? null,
      isActive: rule.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ApprovalRuleFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingRule
        ? `/api/approval-rules/${editingRule.id}`
        : '/api/approval-rules';
      const method = editingRule ? 'PUT' : 'POST';

      const payload = {
        name: data.name,
        approverType: data.approverType,
        approverUserId:
          data.approverType === 'specific_user' ? data.approverUserId : null,
        level: data.level,
        priority: data.priority,
        conditions: {
          ...(data.minDays !== null && { minDays: data.minDays }),
          ...(data.maxDays !== null && { maxDays: data.maxDays }),
        },
        isActive: data.isActive,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save approval rule');
      }

      toast.success(
        editingRule
          ? 'Approval rule updated successfully'
          : 'Approval rule created successfully'
      );
      setIsDialogOpen(false);
      fetchRules();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save approval rule'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;

    try {
      const response = await fetch(`/api/approval-rules/${deletingRule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete approval rule');
      }

      toast.success('Approval rule deleted successfully');
      setDeletingRule(null);
      fetchRules();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete approval rule'
      );
    }
  };

  const toggleRuleStatus = async (rule: ApprovalRule) => {
    try {
      const response = await fetch(`/api/approval-rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rule status');
      }

      toast.success(
        `Rule ${rule.isActive ? 'disabled' : 'enabled'} successfully`
      );
      fetchRules();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update rule status'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group rules by level
  const rulesByLevel = rules.reduce(
    (acc, rule) => {
      const level = rule.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(rule);
      return acc;
    },
    {} as Record<number, ApprovalRule[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground max-w-2xl">
          Configure approval workflows for leave requests. Rules are evaluated
          in order of priority within each level.
        </p>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
              </DialogTitle>
              <DialogDescription>
                {editingRule
                  ? 'Update the approval rule settings below.'
                  : 'Define who should approve leave requests and under what conditions.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Manager approval for vacation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approverType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approver Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="specific_user">
                            Specific User
                          </SelectItem>
                          <SelectItem value="any_admin">Any Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who should approve requests matching this rule
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {approverType === 'specific_user' && (
                  <FormField
                    control={form.control}
                    name="approverUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select User</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member.userId} value={member.userId}>
                                {member.name || member.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Level</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={5} {...field} />
                        </FormControl>
                        <FormDescription>
                          For multi-level approval
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={100} {...field} />
                        </FormControl>
                        <FormDescription>Higher = checked first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Days (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Any"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum leave duration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Days (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Any"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum leave duration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Only active rules are applied
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Saving...'
                      : editingRule
                        ? 'Update Rule'
                        : 'Create Rule'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules display */}
      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Approval Rules</h3>
            <p className="text-muted-foreground">
              Create approval rules to define who should approve leave requests.
            </p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(rulesByLevel)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, levelRules]) => (
            <Card key={level}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Level {level} Approval
                </CardTitle>
                <CardDescription>
                  {level === '1'
                    ? 'First level of approval'
                    : `Level ${level} approval (after level ${Number(level) - 1})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levelRules
                      .sort((a, b) => b.priority - a.priority)
                      .map((rule) => {
                        const Icon =
                          APPROVER_TYPE_ICONS[rule.approverType] || Shield;
                        return (
                          <TableRow
                            key={rule.id}
                            className={
                              !rule.isActive ? 'opacity-50' : undefined
                            }
                          >
                            <TableCell className="font-medium">
                              {rule.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>
                                  {rule.approverType === 'specific_user'
                                    ? rule.approverName || rule.approverEmail
                                    : APPROVER_TYPE_LABELS[rule.approverType]}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {rule.conditions.minDays ||
                              rule.conditions.maxDays ? (
                                <span className="text-sm text-muted-foreground">
                                  {rule.conditions.minDays &&
                                    `Min: ${rule.conditions.minDays}d`}
                                  {rule.conditions.minDays &&
                                    rule.conditions.maxDays &&
                                    ' / '}
                                  {rule.conditions.maxDays &&
                                    `Max: ${rule.conditions.maxDays}d`}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  All requests
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{rule.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule.isActive}
                                onCheckedChange={() => toggleRuleStatus(rule)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(rule)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingRule(rule)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingRule}
        onOpenChange={() => setDeletingRule(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approval Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingRule?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
