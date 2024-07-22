'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { selectedDate } = req.body;
    const stores = await prisma.store.findMany({ cacheStrategy: { ttl: 60 } });

    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const lastDate = new Date(year, date.getMonth() + 1, 0);
    const firstDate = new Date(year, date.getMonth(), 1);
    const sales = await prisma.sales.findMany({
      where: {
        date: {
          gte: firstDate,
          lt: lastDate,
        },
      },
      cacheStrategy: { ttl: 60 },
    });

    res.status(200).json({ stores, sales });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
