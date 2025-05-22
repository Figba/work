'use client';

import React from 'react';
import { Layout } from 'antd';
import AppNavigation from './AppNavigation';

const { Content } = Layout;

interface PageLayoutWithNavProps {
  children: React.ReactNode;
}

export default function PageLayoutWithNav({ children }: PageLayoutWithNavProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppNavigation />
      <Layout>
        <Content style={{ padding: '24px', background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}