'use client';

import { deleteCollection } from '@/actions/collection';
import {
  AlertDialog,
  AlertDialogAction,
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

const DeleteCollectionDialog = ({ collection, entriesCount = 0 }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    loading: isDeleteing,
    fn: deleteCollectionFn,
    data: deletedCollection,
  } = useFetch(deleteCollection);

  useEffect(() => {
    if (deletedCollection && !isDeleteing) {
      setOpen(false);
      toast.error(
        `Collection "${collection.name}" and all  its entries deleted`
      );
      router.push('/dashboard');
    }
  }, [deletedCollection, isDeleteing]);

  const handleDeleteCollection = async () => {
    await deleteCollectionFn(collection.id);
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
          <AlertDialogTitle>
            Delete &quot;{collection ? collection.name : 'Unorganized'}{' '}
            Collections &quot;?
          </AlertDialogTitle>
          <div className="space-y-2 text-muted-foreground text-sm">
            <p>This will permanently delete:</p>
            <ul className="list-disc list-inside">
              <li>The Collection &quot;{collection.name}&quot;</li>
              <li>
                {entriesCount} journal
                {entriesCount === 1 ? ' entry ' : ' entries '}
              </li>
            </ul>
            <p className="font-semibold text-red-600">
              This action cannot be undone
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isDeleteing}
            onClick={handleDeleteCollection}
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleteing ? 'Deleting...' : 'Delete Collection'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCollectionDialog;
