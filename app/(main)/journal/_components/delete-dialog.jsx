'use client';

import { deleteEntry } from '@/actions/journal';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DeleteDialog = ({ entryId }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    loading: isDeleteing,
    fn: deleteEntryFn,
    data: deletedEntry,
  } = useFetch(deleteEntry);

  useEffect(() => {
    if (deletedEntry && !isDeleteing) {
      setOpen(false);
      toast.error(`Journal Entry deleted successfully`);
      router.push(
        `/collection/${
          deletedEntry.collectionId ? deletedEntry.collectionId : 'unorganized'
        }`
      );
    }
  }, [deletedEntry, isDeleteing]);

  const handleDeleteCollection = async () => {
    await deleteEntryFn(entryId);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" /> delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            journal entry
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isDeleteing}
            onClick={handleDeleteCollection}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleteing ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
