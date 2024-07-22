'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const stores = await prisma.store.findMany({ cacheStrategy: { ttl: 60 } });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
}
