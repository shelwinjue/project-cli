import React from 'react';
import DataList from '@/components/dataList';
export default function Home() {
  return (
    <div>
      <DataList list={['Hello', 'React']} />
    </div>
  );
}
