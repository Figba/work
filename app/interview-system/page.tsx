'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Layout, Typography, Card, Tabs, ConfigProvider } from 'antd';
import InterviewInvitation from './components/InterviewInvitation';
import Interviewer from './components/Interviewer';
import InterviewerDashboard from './components/InterviewerDashboard';
// import SystemIntegration from './components/SystemIntegration';
import { useSearchParams } from 'next/navigation';

const { Content } = Layout;
const { Title } = Typography;

// 将使用useSearchParams的逻辑抽离成单独的组件
function InterviewTabs() {
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

  return (
    <>
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
    </>
  );
}

export default function InterviewSystem() {
  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div style={{ minHeight: "64px" }}>
          <Title level={2} aria-label="Interview System" className="mb-6">Interview System</Title>
        </div>
        <Suspense fallback={
          <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-placeholder" aria-hidden="true">Loading...</div>
          </div>
        }>
          <InterviewTabs />
        </Suspense>
      </Content>
    </Layout>
  );
} 