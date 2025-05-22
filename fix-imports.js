const fs = require('fs');
const path = require('path');

// 检查app/interview/page.tsx和app/interview-flow/page.tsx的导入路径
// 并创建所需的组件和类型

// 确保类型目录存在
if (!fs.existsSync(path.join(__dirname, 'app/types'))) {
  fs.mkdirSync(path.join(__dirname, 'app/types'), { recursive: true });
}

// 确保组件目录存在
if (!fs.existsSync(path.join(__dirname, 'app/components'))) {
  fs.mkdirSync(path.join(__dirname, 'app/components'), { recursive: true });
}

if (!fs.existsSync(path.join(__dirname, 'app/components/interview'))) {
  fs.mkdirSync(path.join(__dirname, 'app/components/interview'), { recursive: true });
}

// 创建PageLayoutWithNav组件
const pageLayoutWithNavContent = `
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
`;

// 创建AppNavigation组件
const appNavigationContent = `
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
`;

// 创建interview.ts类型文件
const interviewTypesContent = `
export type InterviewType = 'video' | 'onsite' | 'phone';

export interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  region?: string;
  position: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  title: string;
}

export interface InterviewInvitation {
  id: string;
  candidate: Candidate;
  interviewers: Interviewer[];
  type: InterviewType;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: string;
  expiresAt: string;
}
`;

// 创建InterviewInvitation组件
const interviewInvitationContent = `
'use client';

import React, { useState } from 'react';
import { Form, Radio, Button, Space, Select, Typography, Card } from 'antd';
import { InterviewType, TimeSlot, InterviewInvitation } from '../../types/interview';

const { Option } = Select;
const { Text } = Typography;

interface InterviewInvitationFormProps {
  invitation: InterviewInvitation;
  onSubmit: (values: { type: InterviewType; timeSlot: TimeSlot }) => Promise<void>;
  onResend: () => Promise<void>;
}

export default function InterviewInvitationForm({
  invitation,
  onSubmit,
  onResend
}: InterviewInvitationFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [interviewType, setInterviewType] = useState<InterviewType>('video');

  // Generate mock time slots
  const timeSlots: TimeSlot[] = [
    { date: '2023-06-01', start: '10:00', end: '11:00' },
    { date: '2023-06-01', start: '14:00', end: '15:00' },
    { date: '2023-06-02', start: '10:00', end: '11:00' },
    { date: '2023-06-02', start: '14:00', end: '15:00' },
  ];

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await onSubmit({
        type: values.interviewType,
        timeSlot: values.timeSlot
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ interviewType: 'video' }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Interview Type"
          name="interviewType"
          rules={[{ required: true, message: 'Please select interview type' }]}
        >
          <Radio.Group onChange={(e) => setInterviewType(e.target.value)}>
            <Space direction="vertical">
              <Radio value="video">Video Interview (Zoom)</Radio>
              <Radio value="onsite">Onsite Interview</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Available Time Slots (offered to candidate)"
          name="timeSlot"
          rules={[{ required: true, message: 'Please select at least one time slot' }]}
        >
          <Select placeholder="Select time slot">
            {timeSlots.map((slot, index) => (
              <Option key={index} value={JSON.stringify(slot)}>
                {slot.date} ({slot.start} - {slot.end})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Interview Invitation
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
`;

// 创建CandidateResponse组件
const candidateResponseContent = `
'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Space, List, Radio, Alert } from 'antd';
import { TimeSlot, InterviewType } from '../../types/interview';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface CandidateResponseProps {
  companyName: string;
  position: string;
  interviewType: InterviewType;
  timeSlots: TimeSlot[];
  onConfirm: (selectedSlot: TimeSlot) => Promise<void>;
}

export default function CandidateResponse({
  companyName,
  position,
  interviewType,
  timeSlots,
  onConfirm
}: CandidateResponseProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelectSlot = (slotKey: string) => {
    setSelectedSlot(slotKey);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    
    try {
      setLoading(true);
      const slot = timeSlots.find((_, index) => index.toString() === selectedSlot);
      if (slot) {
        await onConfirm(slot);
        setConfirmed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const groupedSlots = timeSlots.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, TimeSlot[]>);

  if (confirmed) {
    return (
      <Alert
        message="Interview Time Confirmed"
        description="Thank you for confirming your interview time. We look forward to speaking with you!"
        type="success"
        showIcon
      />
    );
  }

  return (
    <Card>
      <Title level={4}>Interview Invitation - {position}</Title>
      <Paragraph>
        {companyName} would like to schedule an interview with you for the {position} position.
      </Paragraph>
      
      <Alert
        message={interviewType === 'video' ? 'Video Interview' : 'On-site Interview'}
        description={
          interviewType === 'video'
            ? 'This will be a video interview. You will receive a meeting link prior to the scheduled time.'
            : 'This will be an in-person interview at our office location.'
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />
      
      <Title level={5}>Please select your preferred interview time:</Title>
      
      <Radio.Group 
        onChange={(e) => handleSelectSlot(e.target.value)} 
        value={selectedSlot}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(groupedSlots).map(([date, slots]) => (
            <Card key={date} size="small" title={dayjs(date).format('MMMM DD, YYYY (dddd)')} style={{ marginBottom: '8px' }}>
              <List
                size="small"
                dataSource={slots}
                renderItem={(slot, index) => (
                  <List.Item>
                    <Radio value={timeSlots.findIndex(s => s.date === slot.date && s.start === slot.start).toString()}>
                      {slot.start} - {slot.end}
                    </Radio>
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </Space>
      </Radio.Group>
      
      <div style={{ marginTop: '24px' }}>
        <Button 
          type="primary" 
          onClick={handleConfirm}
          disabled={!selectedSlot}
          loading={loading}
        >
          Confirm Selected Time
        </Button>
      </div>
    </Card>
  );
}
`;

// 写入类型文件
fs.writeFileSync(path.join(__dirname, 'app/types/interview.ts'), interviewTypesContent.trim());

// 写入组件文件
fs.writeFileSync(path.join(__dirname, 'app/components/PageLayoutWithNav.tsx'), pageLayoutWithNavContent.trim());
fs.writeFileSync(path.join(__dirname, 'app/components/AppNavigation.tsx'), appNavigationContent.trim());
fs.writeFileSync(path.join(__dirname, 'app/components/interview/InterviewInvitation.tsx'), interviewInvitationContent.trim());
fs.writeFileSync(path.join(__dirname, 'app/components/interview/CandidateResponse.tsx'), candidateResponseContent.trim());

console.log('Fix completed: Created necessary files for deployment'); 