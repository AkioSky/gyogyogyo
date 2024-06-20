'use client';

import Dashboard from './dashboard/page';
import { useSession } from 'next-auth/react';
import SignIn from './auth/signin';

const Home = () => {
  const { data: session, status } = useSession();
  console.log('session:', session);
  if (status === 'loading') {
    /* empty */
  }

  if (status === 'unauthenticated') {
    return <SignIn />;
  }

  return <Dashboard />;
};

export default Home;
