'use client';

import Home from './home/page';
import { useSession } from 'next-auth/react';
import SignIn from './auth/signin';

const Page = () => {
  const { data: session, status } = useSession();
  console.log('session:', session);
  if (status === 'loading') {
    /* empty */
  }

  if (status === 'unauthenticated') {
    return <SignIn />;
  }

  return <Home />;
};

export default Page;
