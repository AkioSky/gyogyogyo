'use client';

import { useEffect, useState } from 'react';
import { Hourglass } from 'react-loader-spinner';
import { AgGridReact } from 'ag-grid-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { ja } from 'date-fns/locale';
import { parse, format } from 'date-fns';
import axios from 'axios';
import _ from 'lodash';
import Navbar from '@/app/components/navigation/navbar';

registerLocale('ja', ja);

interface SalesData {
  day: string;
  weekday: string;
  [storeId: string]: string; // Assuming each store ID maps to a string value
}

const japaneseWeekdays = {
  月曜日: '月',
  火曜日: '火',
  水曜日: '水',
  木曜日: '木',
  金曜日: '金',
  土曜日: '土',
  日曜日: '日',
};

const getDayOfWeek = (dateString: string) => {
  const date = parse(dateString, 'yyyy-M-d', new Date());
  const dayOfWeek = format(date, 'EEEE', {
    locale: ja,
  }) as keyof typeof japaneseWeekdays;
  return japaneseWeekdays[dayOfWeek];
};

const getJaDay = (dateString: string) => {
  const date = parse(dateString, 'yyyy-M-d', new Date());
  return format(date, 'd', {
    locale: ja,
  });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};

const getDaysArrayFromMonth = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(`${year}-${month + 1}-${day}`);
  }

  return daysArray;
};

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [calRowData, setCalRowData] = useState<SalesData[]>([]);
  const [calColDefs, setCalColDefs] = useState<ColDef[]>([]);

  useEffect(() => {
    if (selectedMonth) {
      const days = getDaysArrayFromMonth(
        selectedMonth?.getFullYear(),
        selectedMonth?.getMonth()
      );
      setLoading(true);
      axios
        .post(`/api/statistics`, { selectedDate: selectedMonth })
        .then((res) => {
          if (res.status === 200) {
            const stores = _.map(res.data.stores, (item) => ({
              field: item.id,
              headerName: item.name,
              minWidth: 100,
              cellClass: ['text-base', 'text-center', 'border-[#707070]'],
            }));
            const storeIds = _.map(stores, 'field');
            setCalColDefs([
              {
                field: 'day',
                headerName: '',
                minWidth: 70,
                cellClass: [
                  'font-bold',
                  'text-base',
                  'text-center',
                  'border-[#707070]',
                ],
              },
              {
                field: 'weekday',
                headerName: '',
                minWidth: 70,
                cellClass: [
                  'font-bold',
                  'text-base',
                  'text-center',
                  'border-[#707070]',
                ],
              },
              ...stores,
            ]);

            const salesByStore = _.groupBy(res.data.sales, 'storeId');
            console.log('salesByStore:', salesByStore);

            const salesByDay = _.map(
              res.data.sales,
              ({ date, totalSales, storeId }) => ({
                day: formatDate(date),
                sale: totalSales,
                store: storeId,
              })
            );
            const groupedSalesData = _.groupBy(salesByDay, 'day');

            const allSalesByDay = _.map(days, (day) => {
              const groupedByStore = _.groupBy(groupedSalesData[day], 'store');
              const saleByStore = _.reduce(
                storeIds,
                (result, storeId) => {
                  const sale = _.get(groupedByStore, [storeId, 0, 'sale'], '');
                  _.set(result, storeId, sale === '' ? '' : `¥${sale}`);
                  return result;
                },
                {}
              );
              return {
                ...saleByStore,
                day: getJaDay(day),
                weekday: getDayOfWeek(day),
              };
            });
            setCalRowData(allSalesByDay);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log('err:', err);
          setLoading(false);
        });
    }
  }, [selectedMonth]);

  const defaultColDef = {
    flex: 1,
  };

  return (
    <main className='flex h-screen flex-col'>
      <Navbar title='各種データ' />
      <div className='p-4'>
        <div className='my-8'>
          <DatePicker
            dateFormat='MMM yyy'
            showMonthYearPicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            locale='ja'
            wrapperClassName=''
            className='w-56 border-0 text-2xl font-bold'
          />
        </div>
        <div className='ag-theme-quartz' style={{ height: 500 }}>
          {/* <AgGridReact
            rowData={calRowData}
            columnDefs={calColDefs}
            defaultColDef={defaultColDef}
          /> */}

          <AgGridReact
            rowData={calRowData}
            columnDefs={calColDefs}
            defaultColDef={defaultColDef}
          />
        </div>
      </div>
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75'>
          <div
            className='w-30 flex justify-center rounded-lg bg-white p-6 shadow-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <Hourglass
              visible={true}
              height='24'
              width='24'
              ariaLabel='hourglass-loading'
              wrapperClass='self-center my-auto'
              colors={['#000', '#000']}
            />
          </div>
        </div>
      )}
    </main>
  );
}
