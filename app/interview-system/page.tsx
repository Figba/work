'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Tabs, ConfigProvider } from 'antd';
import InterviewInvitation from './components/InterviewInvitation';
import Interviewer from './components/Interviewer';
import InterviewerDashboard from './components/InterviewerDashboard';
// import SystemIntegration from './components/SystemIntegration';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';

const { Content } = Layout;
const { Title } = Typography;

export default function InterviewSystem() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('invitation');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    // 模拟内容加载完成
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams]);

  // 预设高度以减少布局偏移
  const minHeight = 'calc(100vh - 180px)';
  
  const tabItems = [
    {
      key: 'invitation',
      label: 'Interview Invitation',
      children: <InterviewInvitation />
    },
    {
      key: 'interviewer',
      label: 'Interviewer',
      children: <Interviewer />
    },
    {
      key: 'interviewer-dashboard',
      label: 'Interviewer Dashboard',
      children: <InterviewerDashboard />
    },
    {
      key: 'integration',
      label: 'System Integration',
      children: (
        <Card variant="borderless">
          <Typography.Title level={4}>System Integration</Typography.Title>
          <Typography.Paragraph>
            This feature is coming soon...
          </Typography.Paragraph>
        </Card>
      )
    }
  ];

  // 生成JSON-LD结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Interview System',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Manage and schedule interviews with candidates in an enterprise environment',
    'softwareVersion': '1.0.0',
    'author': {
      '@type': 'Organization',
      'name': 'Enterprise System Team'
    }
  };

  return (
    <>
      <Head>
        <title>Interview System | Enterprise System Prototype</title>
        <meta name="description" content="Manage and schedule interviews with candidates" />
        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <Layout className="min-h-screen">
        <Content className="p-6">
          <div style={{ minHeight: "64px" }}>
            <Title level={2} aria-label="Interview System" className="mb-6">Interview System</Title>
          </div>
          {isLoading ? (
            <div style={{ minHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="loading-placeholder" aria-hidden="true">&nbsp;</div>
            </div>
          ) : (
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    inkBarColor: 'var(--primary-color)',
                    itemSelectedColor: 'var(--primary-color)',
                    itemHoverColor: 'var(--primary-color)',
                  }
                }
              }}
            >
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab} 
                items={tabItems}
                className="interview-system-tabs"
                style={{ minHeight }}
              />
            </ConfigProvider>
          )}
        </Content>
      </Layout>
    </>
  );
} 