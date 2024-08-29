'use server';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import _ from 'lodash';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    storeId,
    date,
    products,
    totalSales,
    storeCollection,
    paypayCollection,
    paypayTimeHour,
    paypayTimeMin,
  } = req.body;

  try {
    const productIds = _.map(products, 'id');
    const currentProductCountData = _.map(products, (product) => {
      const remainCount = isNaN(parseInt(product.previousCount))
        ? 0
        : parseInt(product.previousCount);
      const restockCount = isNaN(parseInt(product.restockCount))
        ? 0
        : parseInt(product.restockCount);
      return {
        productId: product.id,
        storeId,
        count: (remainCount + restockCount).toString(),
      };
    });
    const productSaleData = _.map(products, (product) => ({
      date: new Date(date),
      productId: product.id,
      storeId,
      previousCount: product.previousCount.toString(),
      remainCount: product.remainCount.toString(),
      restockCount: product.restockCount.toString(),
    }));
    await prisma.$transaction([
      prisma.currentProductCount.deleteMany({
        where: { productId: { in: productIds }, storeId },
      }),
      prisma.productSale.deleteMany({
        where: { productId: { in: productIds }, storeId, date: new Date(date) },
      }),
      prisma.currentProductCount.createMany({
        data: currentProductCountData,
        skipDuplicates: true,
      }),
      prisma.productSale.createMany({
        data: productSaleData,
        skipDuplicates: true,
      }),
      prisma.sales.create({
        data: {
          date: new Date(date),
          totalSales,
          storeCollection,
          paypayCollection,
          paypayTimeHour,
          paypayTimeMin,
          storeId,
        },
      }),
    ]);

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing request:', error); // Logging the error for server-side monitoring
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
