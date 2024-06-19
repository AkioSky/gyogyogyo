'use client';

import Dashboard from './dashboard';
import { useSession } from 'next-auth/react';
import SignIn from './auth/signin';

const Home = () => {
  const { status } = useSession();
  if (status === 'loading') {
    /* empty */
  }

  if (status === 'unauthenticated') {
    return <SignIn />;
  }

  return <Dashboard />;
};

export default Home;
