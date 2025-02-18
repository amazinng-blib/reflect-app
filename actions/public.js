// "https://api.adviceslip.com/advice",

import { unstable_cache } from 'next/cache';

export const getDailyPrompt = unstable_cache(
  async () => {
    try {
      const response = await fetch('https://api.adviceslip.com/advice', {
        cache: 'no-store',
      });
      const data = await response.json();
      return data.slip.advice;
    } catch (error) {
      return {
        success: false,
        data: "what's on your mind today",
      };
    }
  },
  ['daily-prompt'],
  {
    revalidate: 86400,
    tags: ['daily-prompt'],
  }
);
