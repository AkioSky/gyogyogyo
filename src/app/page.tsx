import Dashboard from './dashboard/page';
import { cookies } from 'next/headers';
import Login from './login/page';

export async function getSession() {
  const sessionId = cookies().get('sessionId')?.value;
  // return sessionId ? await db.findSession(sessionId) : null;
}

export default async function Home() {
  const session = await getSession();

  return <Login />;
}
