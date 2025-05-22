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

export type Region = 'Shanghai' | 'Taipei' | 'Japan';

export interface TimeSlot {
  date: string;
  start: string;
  end: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  region: Region;
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
  videoLink?: string;
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

// 确保services目录存在
if (!fs.existsSync(path.join(__dirname, 'app/services'))) {
  fs.mkdirSync(path.join(__dirname, 'app/services'), { recursive: true });
}

// 创建interview服务文件
const interviewServiceContent = `
import { InterviewInvitation, Region, TimeSlot, InterviewType } from '../types/interview';

// Email templates for different regions
const REJECTION_TEMPLATES: Record<Region, { subject: string; body: string }> = {
  Shanghai: {
    subject: '面试结果通知',
    body: \`尊敬的候选人：

感谢您参加我们的面试。经过慎重考虑，我们认为目前您的技能和经验与该职位的要求不太匹配。

祝您求职顺利！

此致\`,
  },
  Taipei: {
    subject: '面試結果通知',
    body: \`親愛的候選人：

感謝您參加我們的面試。經過審慎考慮，我們認為目前您的技能和經驗與該職位的要求不太匹配。

祝您求職順利！

此致\`,
  },
  Japan: {
    subject: '面接結果のお知らせ',
    body: \`応募者様：

面接にご参加いただき、ありがとうございました。慎重に検討させていただきましたが、残念ながら今回は採用を見送らせていただくことになりました。

今後のご活躍をお祈りしております。

敬具\`,
  },
};

// Generate Google Calendar event
const createGoogleCalendarEvent = async (
  invitation: InterviewInvitation,
  timeSlot: TimeSlot
) => {
  // Implementation would use Google Calendar API
  const event = {
    summary: \`Interview with \${invitation.candidate.name}\`,
    description: \`\${invitation.type === 'video' ? 'Video' : 'On-site'} interview for \${invitation.candidate.position}\`,
    start: {
      dateTime: \`\${timeSlot.date}T\${timeSlot.start}:00\`,
      timeZone: 'Asia/Shanghai',
    },
    end: {
      dateTime: \`\${timeSlot.date}T\${timeSlot.end}:00\`,
      timeZone: 'Asia/Shanghai',
    },
    attendees: [
      { email: invitation.candidate.email },
      ...invitation.interviewers.map((interviewer) => ({ email: interviewer.email })),
    ],
    conferenceData: invitation.type === 'video' ? {
      createRequest: { requestId: invitation.id },
    } : undefined,
  };

  // Return mock data for now
  return {
    ...event,
    conferenceData: invitation.type === 'video' ? {
      conferenceId: 'mock-conference-id',
      entryPoints: [{
        entryPointType: 'video',
        uri: 'https://meet.google.com/mock-meeting-id',
        label: 'Google Meet',
      }],
    } : undefined,
  };
};

// Send DingTalk notification
const sendDingTalkNotification = async (
  invitation: InterviewInvitation,
  timeSlot: TimeSlot
) => {
  // Implementation would use DingTalk API
  const message = {
    msgtype: 'markdown',
    markdown: {
      title: '面试安排通知',
      text: \`### 面试安排通知
- 候选人：\${invitation.candidate.name}
- 职位：\${invitation.candidate.position}
- 时间：\${timeSlot.date} \${timeSlot.start}-\${timeSlot.end}
- 类型：\${invitation.type === 'video' ? '视频面试' : '现场面试'}
\${invitation.type === 'video' ? \`- 会议链接：\${invitation.videoLink}\` : ''}\`,
    },
  };

  // Mock API call
  return Promise.resolve(message);
};

// Send interview invitation email
const sendInterviewEmail = async (
  invitation: InterviewInvitation,
  timeSlot: TimeSlot
) => {
  const subject = \`Interview Invitation - \${invitation.candidate.position}\`;
  const body = \`Dear \${invitation.candidate.name},

You have been invited for a\${invitation.type === 'video' ? ' video' : 'n on-site'} interview for the position of \${invitation.candidate.position}.

Time: \${timeSlot.date} \${timeSlot.start}-\${timeSlot.end}
\${invitation.type === 'video' ? \`Meeting Link: \${invitation.videoLink}\` : ''}

Best regards,\`;

  // Mock email sending
  return Promise.resolve({ subject, body });
};

// Send rejection email
const sendRejectionEmail = async (
  invitation: InterviewInvitation
) => {
  const template = REJECTION_TEMPLATES[invitation.candidate.region];
  
  // Mock email sending
  return Promise.resolve({
    to: invitation.candidate.email,
    subject: template.subject,
    body: template.body,
  });
};

export const interviewService = {
  createGoogleCalendarEvent,
  sendDingTalkNotification,
  sendInterviewEmail,
  sendRejectionEmail,
};
`;

// 创建interview-system的metadata文件
const interviewSystemMetadataContent = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interview System | Enterprise System Prototype',
  description: 'Manage and schedule interviews with candidates',
  applicationName: 'Enterprise System',
  authors: [{ name: 'Enterprise System Team' }],
  keywords: ['interview', 'recruitment', 'HR', 'enterprise system'],
  openGraph: {
    title: 'Interview System | Enterprise System Prototype',
    description: 'Manage and schedule interviews with candidates in an enterprise environment',
    type: 'website',
  },
  other: {
    'schema:application': JSON.stringify({
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
    })
  }
};
`;

// 确保interview-system目录存在
if (!fs.existsSync(path.join(__dirname, 'app/interview-system'))) {
  fs.mkdirSync(path.join(__dirname, 'app/interview-system'), { recursive: true });
}

// 写入服务和元数据文件
fs.writeFileSync(path.join(__dirname, 'app/services/interview.ts'), interviewServiceContent.trim());
fs.writeFileSync(path.join(__dirname, 'app/interview-system/metadata.ts'), interviewSystemMetadataContent.trim());

console.log('Fix completed: Created necessary files for deployment'); 