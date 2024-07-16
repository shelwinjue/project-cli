import React from 'react';
import DataList from '@/components/dataList';
export default function CreatePage() {
  return (
    <div>
      <DataList canCreate={true} />
    </div>
  );
}
