'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-quill-new/dist/quill.snow.css';
//prevent server side rendering in client component
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import { zodResolver } from '@hookform/resolvers/zod';
import { journalSchema } from '@/app/lib/schema';
import { BarLoader } from 'react-spinners';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMoodById, MOODS } from '@/app/lib/moods';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/useFetch';
import {
  createJournal,
  getDraft,
  getJournalEntry,
  saveDraft,
  updateJournalEntry,
} from '@/actions/journal';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createCollection, getCollections } from '@/actions/collection';
import CollectionForm from '@/components/collection-dialog';
import { Loader2 } from 'lucide-react';

const JournalEntryPage = () => {
  const [isCollectionDailogOpen, setIsCollectionDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    loading: entryLoading,
    fn: fetchEntry,
    data: existingEntry,
  } = useFetch(getJournalEntry);

  const {
    loading: draftLoading,
    fn: fetchDraft,
    data: draftData,
  } = useFetch(getDraft);
  const {
    loading: saveDraftLoading,
    fn: saveDraftFn,
    data: savedDraft,
  } = useFetch(saveDraft);

  const {
    loading: actionLoading,
    fn: actionFn,
    data: actionResult,
  } = useFetch(isEditMode ? updateJournalEntry : createJournal);

  const {
    loading: collectionLoading,
    fn: fetchCollectionsFn,
    data: collectionResult,
  } = useFetch(getCollections);

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createCollectionResult,
  } = useFetch(createCollection);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
    getValues,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: '',
      content: '',
      mood: '',
      collectionId: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const mood = getMoodById(data.mood);
    await actionFn({
      ...data,
      moodScore: mood.score,
      moodQuery: mood.pixabayQuery,
      ...(isEditMode && { id: editId }),
    });
  });

  const formData = watch();

  const handleSaveDraft = async () => {
    if (!isDirty) {
      toast.error('No changes to save');
      return;
    }
    await saveDraftFn(formData);
  };

  const handleCreateCollection = async (data) => {
    createCollectionFn(data);
  };

  useEffect(() => {
    fetchCollectionsFn();
  }, []);

  useEffect(() => {
    if (savedDraft?.success && !saveDraftLoading) {
      toast.success('Draft saved successfully');
    }
  }, [savedDraft, saveDraftLoading]);
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      fetchEntry(editId);
    } else {
      fetchDraft();
      setIsEditMode(false);
    }
  }, [editId]);

  useEffect(() => {
    if (isEditMode && existingEntry) {
      reset({
        title: existingEntry.title || '',
        content: existingEntry.content || '',
        mood: existingEntry.mood || '',
        collectionId: existingEntry.collectionId || '',
      });
    } else if (draftData?.success && draftData?.data) {
      reset({
        title: draftData.data.title || '',
        content: draftData.data.content || '',
        mood: draftData.data.mood || '',
        collectionId: draftData.data.collectionId || '',
      });
    } else {
      reset({
        title: '',
        content: '',
        mood: '',
        collectionId: '',
      });
    }
  }, [draftData, isEditMode, existingEntry]);

  useEffect(() => {
    if (actionResult && !actionLoading) {
      if (!isEditMode) {
        saveDraftFn({ title: '', content: '', mood: '' });
      }
      router.push(
        `/collection/${
          actionResult.collectionId ? actionResult.collectionId : 'unorganized'
        }`
      );

      toast.success(
        `Entry ${isEditMode ? ' updated ' : ' created '} created successfully`
      );
    }
  }, [actionResult, actionLoading]);

  useEffect(() => {
    if (createCollectionResult) {
      setIsCollectionDialogOpen(false);
      fetchCollectionsFn();
      setValue('collectionId', createCollectionResult.id);

      toast.success(`Collection ${createCollectionResult.name} created`);
    }
  }, [createCollectionResult]);

  const isLoading =
    actionLoading ||
    collectionLoading ||
    createCollectionLoading ||
    entryLoading ||
    draftLoading ||
    saveDraftLoading;
  return (
    <div className="py-8">
      <form className="space-y-2 mx-auto" onSubmit={onSubmit}>
        <h1 className="text-5xl md:text-6xl gradient-title mb-2">
          {isEditMode ? 'Edit Entry' : "What's on your mind?"}
        </h1>

        {isLoading && <BarLoader color="orange" width={'100%'} />}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            disabled={isLoading}
            {...register('title')}
            placeholder="Give your entry title..."
            className={`py-5 md:text-md ${
              errors.title ? 'border-red-500' : ''
            }`}
          />

          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            How are you feeling?
          </label>

          <Controller
            name="mood"
            control={control}
            render={({ field }) => {
              return (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={errors.mood ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select a mood..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MOODS).map((mood) => {
                      return (
                        <SelectItem key={mood.id} value={mood.id}>
                          <span className="flex items-center gap-2">
                            {mood.emoji} {mood.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.mood && (
            <p className="text-red-500 text-sm">{errors.mood.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            {getMoodById(watch('mood'))?.prompt ?? 'Write your thoughts...'}
          </label>

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <ReactQuill
                readOnly={isLoading}
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean'],
                  ],
                }}
              />
            )}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Add to Collection (Optional)
          </label>

          <Controller
            name="collectionId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  if (value === 'new') {
                    setIsCollectionDialogOpen(true);
                  } else {
                    field.onChange(value);
                  }
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collectionResult?.map((collection) => {
                    return (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    );
                  })}

                  <SelectItem value="new">
                    <span className="text-orange-600 cursor-pointer">
                      + Create New Collection
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.collectionId && (
            <p className="text-red-500 text-sm">
              {errors.collectionId.message}
            </p>
          )}
        </div>

        <div className="space-x-4 flex">
          {!isEditMode && (
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={isLoading || !isDirty}
            >
              {saveDraftLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save as Draft
            </Button>
          )}
          <Button
            type="submit"
            variant="journal"
            disabled={isLoading || !isDirty}
          >
            {isEditMode ? 'Update' : 'Publish'}
          </Button>
          {isEditMode && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                router.push(`collection/${existingEntry.id}`);
              }}
              variant="destructive"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <CollectionForm
        loading={createCollectionLoading}
        onSuccess={handleCreateCollection}
        open={isCollectionDailogOpen}
        setOpen={setIsCollectionDialogOpen}
      />
    </div>
  );
};

export default JournalEntryPage;
