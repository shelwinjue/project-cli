import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '@/layout';
import Home from '@/pages/home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace={true} />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'home',
        element: <Home />,
      },
    ],
  },
]);
