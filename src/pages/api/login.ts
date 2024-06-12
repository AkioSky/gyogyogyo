'use server';
import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

// bcrypt.hash(password, 10).then(function (hash) {
//   console.log('hash password:', hash);
// });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Query the database to find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ status: 'Error', message: 'ID not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      // Passwords don't match, return an error message
      res.status(403).json({ status: 'Error', message: 'Invalid password' });
    }

    // Passwords match, return a success message
    res.status(200).json({ status: 'Success', message: 'Login successful' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`login method ${req.method} not allowed`);
  }
}
