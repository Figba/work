'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Space } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider } = Layout;
const { Text } = Typography;

const AppNavigation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: '/interview-system',
      icon: <UserOutlined />,
      label: <Link href="/interview-system">Interview System</Link>,
    },
    {
      key: '/interview-flow',
      icon: <CalendarOutlined />,
      label: <Link href="/interview-flow">Interview Flow</Link>,
    },
    {
      key: '/interview',
      icon: <TeamOutlined />,
      label: <Link href="/interview">Candidate View</Link>,
    },
  ];

  const getSelectedKeys = () => {
    // Find the most specific match
    return menuItems
      .filter(item => pathname.startsWith(item.key))
      .sort((a, b) => b.key.length - a.key.length) // Sort by length descending
      .map(item => item.key)
      .slice(0, 1); // Take only the first one
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
      trigger={null}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        {collapsed ? (
          <Avatar size="large" style={{ backgroundColor: '#1677ff' }}>E</Avatar>
        ) : (
          <Space direction="vertical" size={0}>
            <Avatar size="large" style={{ backgroundColor: '#1677ff' }}>E</Avatar>
            <Text strong style={{ fontSize: '16px', marginTop: '8px' }}>Enterprise System</Text>
          </Space>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
      
      <div style={{ position: 'absolute', bottom: '0', width: '100%', padding: '16px' }}>
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>
    </Sider>
  );
};

export default AppNavigation;