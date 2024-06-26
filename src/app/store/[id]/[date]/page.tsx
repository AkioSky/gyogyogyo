'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/navigation/navbar';
import Loader from '@/app/components/loader';

export default function Page({
  params,
}: {
  params: { date: string; id: string };
}) {
  console.log('date:', params);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post('/api/product')
      .then((res) => {
        console.log('res:', res.data);
        // setStores(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log('err:', err);
        // setStores([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader />;
  else
    return (
      <main>
        <Navbar title='納品回収 集計ページ' />
      </main>
    );
}
