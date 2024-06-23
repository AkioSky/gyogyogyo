'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.body;
    const store = await prisma.store.findUnique({ where: { id } });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
}
