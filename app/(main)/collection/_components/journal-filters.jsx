'use client';

import { MOODS } from '@/app/lib/moods';
import EntryCard from '@/components/entry-card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const JournalFilters = ({ entries = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [date, setDate] = useState('');
  const [filteredEntries, setFilteredEntries] = useState(entries);

  useEffect(() => {
    let filtered = entries;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry?.title?.toLowerCase().includes(query) ||
          entry?.content?.toLowerCase().includes(query)
      );
    }

    // Apply mood filter
    if (selectedMood) {
      filtered = filtered.filter((entry) => entry.mood === selectedMood);
    }

    // Apply date filter
    if (date) {
      filtered = filtered.filter(
        (entry) => isSameDay(new Date(entry.createdAt), new Date(date)) // Ensure `date` is a Date object
      );
    }

    setFilteredEntries(filtered);
  }, [searchQuery, selectedMood, date]); // ✅ Added `entries`

  const clearFilters = () => {
    setSearchQuery('');
    setDate(null);
    setSelectedMood('');
  };
  return (
    <>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>

        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by mood..." />
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(searchQuery || selectedMood || date) && (
          <Button
            variant="ghost"
            className="text-orange-600"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredEntries.length} of {entries.length}{' '}
        {entries.length > 1 ? 'entries' : 'entry'}
      </div>

      {filteredEntries?.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-500"> No entries found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEntries?.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
};

export default JournalFilters;
