'use client';
import React, { useState, useEffect } from 'react';
import CollectionPreview from './collection-preview';
import CollectionForm from '@/components/collection-dialog';
import useFetch from '@/hooks/useFetch';
import { createCollection } from '@/actions/collection';
import { toast } from 'sonner';

const Collections = ({ collections = [], entriesByCollection }) => {
  const [isCollectionDailogOpen, setIsCollectionDialogOpen] = useState(false);

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createCollectionResult,
  } = useFetch(createCollection);

  const handleCreateCollection = async (data) => {
    createCollectionFn(data);
  };

  if (collections.length === 0) return <></>;

  useEffect(() => {
    if (createCollectionResult) {
      setIsCollectionDialogOpen(false);
      toast.success(`Collection ${createCollectionResult.name} created`);
    }
  }, [createCollectionResult]);

  return (
    <section id="collections" className="space-y-6">
      <h2 className="text-3xl font-bold gradient-title ">Colelctions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CollectionPreview
          isCreateNew={true}
          onCreateNew={() => setIsCollectionDialogOpen(true)}
        />

        {entriesByCollection?.unorganized?.length > 0 && (
          <CollectionPreview
            name="Unorganized"
            entries={entriesByCollection.unorganized}
            isUnorganized={true}
          />
        )}

        {collections?.map((collection) => (
          <CollectionPreview
            key={collection.id}
            id={collection.id}
            name={collection.name}
            entries={entriesByCollection[collection.id] || []}
          />
        ))}

        <CollectionForm
          loading={createCollectionLoading}
          onSuccess={handleCreateCollection}
          open={isCollectionDailogOpen}
          setOpen={setIsCollectionDialogOpen}
        />
      </div>
    </section>
  );
};

export default Collections;
