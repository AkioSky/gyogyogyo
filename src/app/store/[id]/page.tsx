'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import Navbar from '@/app/components/navigation/navbar';
import Loader from '@/app/components/loader';
import { Store } from '@prisma/client';

// type ValuePiece = Date | null;

// type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  // const [value, setValue] = useState<Value>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      axios
        .post(`/api/store/item`, { id: params.id })
        .then((res) => {
          setStore(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.log('err:', err);
          setStore(null);
          setLoading(false);
        });
    }
  }, [params.id]);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset time part for accurate comparison

      if (date.getDate() === 4 || date.getDate() === 11) {
        return 'calendar-date-input';
      } else if (date < today) {
        return 'calendar-date-before-today';
      }
    }
    return '';
  };

  const formatMonthYear = (locale: string | undefined, date: Date) => {
    return date.toLocaleString(locale, { month: 'long' });
  };

  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  if (loading) return <Loader />;
  else
    return (
      <main className='flex h-screen flex-col'>
        <Navbar title='カレンダー' />
        {store && (
          <>
            <div className='bg-[#EAEAEA] py-2 text-center'>
              <p className='text-xl font-bold'>{store?.name}</p>
            </div>
            <div className='flex flex-1 flex-col justify-between'>
              <div className='mt-4 flex items-center justify-center'>
                <Calendar
                  calendarType='gregory'
                  tileClassName={tileClassName}
                  showNeighboringMonth={false}
                  locale='ja'
                  view='month'
                  nextLabel={
                    <Image
                      width={13}
                      height={22}
                      src='/right_arrow.svg'
                      alt={'next-icon'}
                    />
                  }
                  next2Label={null}
                  prevLabel={
                    <Image
                      width={13}
                      height={22}
                      src='/left_arrow.svg'
                      alt={'left-icon'}
                    />
                  }
                  prev2Label={null}
                  formatMonthYear={formatMonthYear}
                  formatDay={formatDay}
                  onClickDay={(value) => {
                    const day = value.toISOString().split('T')[0];
                    router.push(`/store/${params.id}/${day}`);
                  }}
                />
              </div>
              <div className='mb-12'>
                <p className='text-center text-[22px] font-bold'>
                  今月の累計売上
                </p>
                <p className='my-1 text-center text-[22px] font-bold'>¥0</p>
                <p className='font-xl text-center text-[16px]'>
                  最終集計日：03/11
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    );
}
