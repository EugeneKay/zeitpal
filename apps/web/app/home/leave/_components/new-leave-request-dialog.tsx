'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';

import { LeaveRequestForm } from '../request/_components/leave-request-form';

export function NewLeaveRequestDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          <Trans i18nKey="leave:dashboard.newRequest" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="leave:request.title" defaults="New Leave Request" />
          </DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey="leave:request.description"
              defaults="Submit a new leave request for approval."
            />
          </DialogDescription>
        </DialogHeader>

        <LeaveRequestForm
          compact
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
