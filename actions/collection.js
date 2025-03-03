'use server';
import aj from '@/lib/arcjet';
import { db } from '@/lib/prisma';
import { request } from '@arcjet/next';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function createCollection(data) {
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

    const collections = await db.collection.create({
      data: {
        name: data.name,
        description: data.description,
        userId: user.id,
      },
    });

    revalidatePath('/dashboard');
    return collections;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getCollections() {
  const { userId } = await auth();

  if (!userId) throw new Error('UnAuthorized');

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error('User not found');

  const collections = await db.collection.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return collections;
}

export async function getCollection(collectionId) {
  const { userId } = await auth();
  if (!userId) throw new Error('UnAuthorized');

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) throw new Error('User not found');

  const collection = await db.collection.findUnique({
    where: {
      userId: user.id,
      id: collectionId,
    },
  });
  return collection;
}

export async function deleteCollection(collectionId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('UnAuthorized');

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error('User not found');

    const collection = await db.collection.findFirst({
      where: {
        userId: user.id,
        id: collectionId,
      },
    });
    if (!collection) throw new Error('Collection not found');

    await db.collection.delete({
      where: {
        id: collectionId,
      },
    });

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}
