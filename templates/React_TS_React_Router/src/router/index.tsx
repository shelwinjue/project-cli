import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/layout';
import CreatePage from '@/pages/create';
import ViewPage from '@/pages/view';

export const router = createBrowserRouter([
  {
    path: '/data-manage',
    element: <Layout />,
    children: [
      {
        path: 'create',
        element: <CreatePage />,
      },
      {
        path: 'view',
        element: <ViewPage />,
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/data-manage/create" replace={true} />,
  },
]);
