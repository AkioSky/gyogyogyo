'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import _ from 'lodash';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, startDate } = req.body;
    const store = await prisma.store.findUnique({ where: { id } });

    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so we add 1
    const lastDate = new Date(year, month, 0);
    const sales = await prisma.sales.findMany({
      where: {
        storeId: id,
        date: {
          gte: startDate,
          lt: lastDate,
        },
      },
    });

    const dates = _.map(sales, 'date');
    const days = _.map(dates, (date) => date.getDate());
    const totalSalesSum = _.sumBy(sales, 'totalSales');

    res.status(200).json({ store, days, totalSalesSum });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
}
