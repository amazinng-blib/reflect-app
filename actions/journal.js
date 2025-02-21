'use server';

import { getMoodById, MOODS } from '@/app/lib/moods';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getPixabayImage } from './public';
import { revalidatePath } from 'next/cache';
import { request } from '@arcjet/next';
import aj from '@/lib/arcjet';

export async function createJournal(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('UnAuthorized');

    // ArcJet Rate Limiting

    const req = await request();
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.log({
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error('Too many request. Please try again later.');
      }

      throw new Error('Request blocked.');
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error('User not found');

    const mood = MOODS[data.mood.toUpperCase()];
    if (!mood) throw new Error('Invalid mood');

    const moodImageUrl = await getPixabayImage(data.moodQuery);
    const entry = await db.entry.create({
      data: {
        title: data.title,
        content: data.content,
        mood: mood.id,
        moodScore: mood.score,
        moodImageUrl,
        userId: user.id,
        collectionId: data.collectionId || null,
      },
    });

    await db.draft.deleteMany({
      where: {
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');

    return entry;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getJournalEntries({
  collectionId,
  orderBy = 'desc',
} = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('UnAuthorized');

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error('User not found');

    const entries = await db.entry.findMany({
      where: {
        userId: user.id,
        ...(collectionId === 'unorganized'
          ? { collectionId: null }
          : collectionId
          ? { collectionId }
          : {}),
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy,
      },
    });

    const entriesWithMoodData = entries.map((entry) => ({
      ...entry,
      moodData: getMoodById(entry.mood),
    }));

    return {
      success: true,
      data: {
        entries: entriesWithMoodData,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
