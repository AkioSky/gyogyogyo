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
  const day = date.getUTCDate();
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
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    setViewportHeight(window.innerHeight);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            const storeById = _.keyBy(res.data.stores, 'id');
            setCalColDefs([
              {
                field: 'day',
                headerName: '',
                minWidth: 80,
                cellClass: [
                  'font-bold',
                  'text-base',
                  'text-center',
                  'border-[#707070]',
                ],
                colSpan: (params) => {
                  if (params.data.weekday === '') {
                    return 2;
                  }
                  return 1;
                },
              },
              {
                field: 'weekday',
                headerName: '',
                minWidth: 80,
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
            const sumTotalSalesByStore: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'totalSales')
                );
                return result;
              },
              {}
            );
            const sumCashByStore: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'storeCollection')
                );
                return result;
              },
              {}
            );
            const sumPayPayByStore: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'paypayCollection')
                );
                return result;
              },
              {}
            );
            const sumCollectedByStore: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'paypayCollection') +
                    _.sumBy(salesByStore[storeId], 'storeCollection')
                );
                return result;
              },
              {}
            );
            const sumDiffCostByStore: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'paypayCollection') +
                    _.sumBy(salesByStore[storeId], 'storeCollection') -
                    _.sumBy(salesByStore[storeId], 'totalSales')
                );
                return result;
              },
              {}
            );
            const sharingByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].sharing);
                return result;
              },
              {}
            );
            const rentByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].rent);
                return result;
              },
              {}
            );
            const ebByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].eb);
                return result;
              },
              {}
            );
            const usenByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].usen);
                return result;
              },
              {}
            );
            const outsourcingByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].outsourcing);
                return result;
              },
              {}
            );
            const sgaByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  storeById[storeId].rent +
                    storeById[storeId].eb +
                    storeById[storeId].usen +
                    storeById[storeId].outsourcing
                );
                return result;
              },
              {}
            );
            const costByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, storeById[storeId].cost);
                return result;
              },
              {}
            );
            const profitByStoreId: { [key: string]: number } = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(
                  result,
                  storeId,
                  _.sumBy(salesByStore[storeId], 'totalSales') -
                    (storeById[storeId].rent +
                      storeById[storeId].eb +
                      storeById[storeId].usen +
                      storeById[storeId].outsourcing +
                      storeById[storeId].etc)
                );
                return result;
              },
              {}
            );

            const sortedStoreArr = _.orderBy(
              _.toPairs(sumTotalSalesByStore),
              ([, value]) => value,
              ['desc']
            );
            let rank = 1;
            let previousValue = sortedStoreArr[0][1];
            const salesRankByStore: { [key: string]: string } = {};
            sortedStoreArr.forEach(([key, value], index) => {
              if (value < previousValue) {
                rank = index + 1;
              }
              salesRankByStore[key] = `${rank}位`;
              previousValue = value;
            });

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

            const emptyRowData = _.reduce(
              storeIds,
              (result, storeId) => {
                _.set(result, storeId, '');
                return result;
              },
              {}
            );

            setCalRowData([
              {
                day: '売上ランキング ',
                weekday: '',
                ...salesRankByStore,
              },
              {
                day: '自社総売上',
                weekday: '',
                ..._.mapValues(sumTotalSalesByStore, (value) => `¥${value}`),
              },
              {
                day: '現金回収',
                weekday: '',
                ..._.mapValues(sumCashByStore, (value) => `¥${value}`),
              },
              {
                day: 'paypay回収',
                weekday: '',
                ..._.mapValues(sumPayPayByStore, (value) => `¥${value}`),
              },
              {
                day: '総回収額',
                weekday: '',
                ..._.mapValues(sumCollectedByStore, (value) => `¥${value}`),
              },
              {
                day: '差額',
                weekday: '',
                ..._.mapValues(sumDiffCostByStore, (value) =>
                  value >= 0 ? `¥${value}` : `-¥${Math.abs(value)}`
                ),
              },
              {
                day: 'シェアリング売上',
                weekday: '',
                ..._.mapValues(sharingByStoreId, (value) => `¥${value}`),
              },
              {
                day: '家賃',
                weekday: '',
                ..._.mapValues(rentByStoreId, (value) => `¥${value}`),
              },
              {
                day: '電気代',
                weekday: '',
                ..._.mapValues(ebByStoreId, (value) => `¥${value}`),
              },
              {
                day: 'USEN',
                weekday: '',
                ..._.mapValues(usenByStoreId, (value) => `¥${value}`),
              },
              {
                day: '外部委託費',
                weekday: '',
                ..._.mapValues(outsourcingByStoreId, (value) => `¥${value}`),
              },
              {
                day: '販売管理費合計',
                weekday: '',
                ..._.mapValues(sgaByStoreId, (value) => `¥${value}`),
              },
              // {
              //   day: '商品原価',
              //   weekday: '',
              //   ..._.mapValues(costByStoreId, (value) => `¥${value}`),
              // },
              {
                day: '当月利益',
                weekday: '',
                ..._.mapValues(profitByStoreId, (value) =>
                  value >= 0 ? `¥${value}` : `-¥${Math.abs(value)}`
                ),
              },
              {
                day: '',
                weekday: '',
                ...emptyRowData,
              },
              ...allSalesByDay,
            ]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log('err:', err);
          setLoading(false);
        });
    }
  }, [selectedMonth]);

  return (
    <main className='flex h-screen flex-col'>
      <Navbar title='各種データ' />
      <div className='p-4'>
        <div className='my-8 text-center'>
          <DatePicker
            dateFormat='MMM yyy'
            showMonthYearPicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            locale='ja'
            wrapperClassName=''
            className='w-56 border-0 text-center text-2xl font-bold'
            maxDate={new Date()}
          />
        </div>
        <div
          className='ag-theme-quartz'
          style={{ height: viewportHeight - 180 }}
        >
          <AgGridReact
            rowData={calRowData}
            columnDefs={calColDefs}
            defaultColDef={{
              flex: 1,
            }}
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
