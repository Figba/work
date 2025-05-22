'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Radio, Badge, Button, Alert, Divider, Typography, Space, Tag, Row, Col, TimePicker, DatePicker, Modal, Select, Input, Empty, Table, Avatar } from 'antd';
import { CalendarOutlined, MailOutlined, VideoCameraOutlined, UserOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Define candidate interface
interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'pending' | 'sent' | 'scheduled' | 'completed';
  date: string;
}

interface TimeSlot {
  id: string;
  time: string;
  date: string;
  weekday: string;
  available: boolean;
}

interface EmailTemplate {
  greeting: string;
  introduction: string;
  reminders: string[];
  aboutUs: string;
  closing: string;
}

export default function InterviewInvitation() {
  const router = useRouter();
  const setupCardRef = useRef<HTMLDivElement>(null);
  const [interviewType, setInterviewType] = useState<string>('video');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('9:00 - 10:00');
  const [isEmailEditMode, setIsEmailEditMode] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Add candidates list state
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Zhang Wei',
      email: 'zhang.wei@example.com',
      position: 'Frontend Developer',
      status: 'pending',
      date: dayjs().format('YYYY-MM-DD')
    },
    {
      id: '2',
      name: 'Li Ming',
      email: 'li.ming@example.com',
      position: 'Backend Engineer',
      status: 'sent',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    },
    {
      id: '3',
      name: 'Wang Lin',
      email: 'wang.lin@example.com',
      position: 'UI/UX Designer',
      status: 'scheduled',
      date: dayjs().subtract(2, 'day').format('YYYY-MM-DD')
    },
    {
      id: '4',
      name: 'Chen Jie',
      email: 'chen.jie@example.com',
      position: 'DevOps Engineer',
      status: 'pending',
      date: dayjs().format('YYYY-MM-DD')
    },
    {
      id: '5',
      name: 'Liu Yang',
      email: 'liu.yang@example.com',
      position: 'Data Scientist',
      status: 'pending',
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    }
  ]);
  
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    greeting: 'Hello [Candidate Name],',
    introduction: "I'm the HR from Tuwaii Technology. We'd like to invite you for an interview. Please find the details below.",
    reminders: [
      'Please join 5-10 minutes early and ensure your network connection is stable',
      'This is a video interview, please make sure your camera is working properly'
    ],
    aboutUs: 'We (Tuwaii Shanghai Technology) are a startup focused on revolutionizing the gaming industry through Artificial Intelligence (AI). We collaborate with overseas partners to develop H5 game platforms and work with well-known anime brands to promote and develop various ACG culture IPs.',
    closing: 'Looking forward to your participation!'
  });
  
  // Generate 5 weekday time slots initially
  useEffect(() => {
    if (timeSlots.length === 0) {
      const newSlots: TimeSlot[] = [];
      const today = dayjs();
      const startHour = 9; // Starting at 9 AM
      
      // Generate 5 weekdays starting from tomorrow
      let currentDate = today.add(1, 'day');
      let slotCount = 0;
      
      while (slotCount < 5) {
        const day = currentDate.day();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (day !== 0 && day !== 6) {
          const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          newSlots.push({
            id: `slot-${slotCount}`,
            time: `${startHour + slotCount % 5}:00 - ${startHour + slotCount % 5 + 1}:00`,
            date: currentDate.format('YYYY-MM-DD'),
            weekday: weekdays[day],
            available: true
          });
          slotCount++;
        }
        currentDate = currentDate.add(1, 'day');
      }
      
      setTimeSlots(newSlots);
    }
  }, [timeSlots.length]);

  const handleDeleteTimeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
  };

  const showTimePicker = () => {
    setIsTimePickerOpen(true);
    setSelectedDate(dayjs().add(1, 'day')); // Default to tomorrow
    setSelectedTime('9:00 - 10:00'); // Default time slot
  };

  const handleTimePickerCancel = () => {
    setIsTimePickerOpen(false);
  };

  const handleTimePickerOk = () => {
    if (selectedDate) {
      const newId = `slot-${Date.now()}`;
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = selectedDate.day();
      
      // Only add if it's a weekday
      if (day !== 0 && day !== 6) {
        setTimeSlots([
          ...timeSlots,
          {
            id: newId,
            time: selectedTime,
            date: selectedDate.format('YYYY-MM-DD'),
            weekday: weekdays[day],
            available: true
          }
        ]);
        setIsTimePickerOpen(false);
      } else {
        // If weekend was selected, show an alert or message
        alert('Please select a weekday (Monday to Friday)');
      }
    } else {
      alert('Please select a date');
    }
  };

  const timeOptions = [
    '9:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  const handleAddTimeSlot = () => {
    // Show the time picker modal
    showTimePicker();
  };

  const handleSubmit = () => {
    // Navigate to the Interviewer page
    router.push('/interview-system?tab=interviewer');
  };

  // Disable weekend dates
  const disabledDate = (current: Dayjs) => {
    const day = current.day();
    return current < dayjs().endOf('day') || day === 0 || day === 6;
  };
  
  const toggleEmailEditMode = () => {
    setIsEmailEditMode(!isEmailEditMode);
  };

  const handleEmailChange = (field: keyof EmailTemplate, value: any) => {
    setEmailTemplate({
      ...emailTemplate,
      [field]: value
    });
  };

  const handleReminderChange = (index: number, value: string) => {
    const updatedReminders = [...emailTemplate.reminders];
    updatedReminders[index] = value;
    setEmailTemplate({
      ...emailTemplate,
      reminders: updatedReminders
    });
  };

  const handleSendInvitation = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    
    // Update email greeting with candidate name
    setEmailTemplate({
      ...emailTemplate,
      greeting: `Hello ${candidate.name},`
    });
    
    // Scroll to setup card after state update
    setTimeout(() => {
      setupCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderEmailPreview = () => {
    if (isEmailEditMode) {
      return (
        <Form layout="vertical">
          <Form.Item label="Greeting">
            <Input 
              value={emailTemplate.greeting} 
              onChange={(e) => handleEmailChange('greeting', e.target.value)}
            />
          </Form.Item>
          
          <Form.Item label="Introduction">
            <TextArea 
              rows={2} 
              value={emailTemplate.introduction} 
              onChange={(e) => handleEmailChange('introduction', e.target.value)}
            />
          </Form.Item>
          
          <Form.Item label="Reminders">
            {emailTemplate.reminders.map((reminder, index) => (
              <Input
                key={index}
                value={reminder}
                style={{ marginBottom: 8 }}
                onChange={(e) => handleReminderChange(index, e.target.value)}
              />
            ))}
          </Form.Item>
          
          <Form.Item label="About Us">
            <TextArea 
              rows={3} 
              value={emailTemplate.aboutUs} 
              onChange={(e) => handleEmailChange('aboutUs', e.target.value)}
            />
          </Form.Item>
          
          <Form.Item label="Closing">
            <Input 
              value={emailTemplate.closing} 
              onChange={(e) => handleEmailChange('closing', e.target.value)}
            />
          </Form.Item>
          
          <Button type="primary" onClick={toggleEmailEditMode}>
            Save Changes
          </Button>
        </Form>
      );
    } else {
      return (
        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <Paragraph>
            <Text strong>{emailTemplate.greeting}</Text>
          </Paragraph>
          <Paragraph>
            {emailTemplate.introduction}
          </Paragraph>
          <Paragraph>
            <Text strong>Friendly Reminder:</Text><br/>
            {emailTemplate.reminders.map((reminder, index) => (
              <React.Fragment key={index}>
                • {reminder}<br/>
              </React.Fragment>
            ))}
          </Paragraph>
          <Paragraph>
            <Text strong>About Us:</Text><br/>
            {emailTemplate.aboutUs}
          </Paragraph>
          <Paragraph>
            {emailTemplate.closing}
          </Paragraph>
        </div>
      );
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Candidate Interview Invitations" variant="borderless">
            <Table 
              dataSource={candidates} 
              rowKey="id"
              pagination={false}
              style={{ marginBottom: 16 }}
            >
              <Table.Column 
                title="ID" 
                dataIndex="id" 
                key="id" 
              />
              <Table.Column 
                title="Candidate" 
                dataIndex="name" 
                key="name" 
                render={(text, record: Candidate) => (
                  <Space>
                    <Avatar style={{ backgroundColor: '#1677ff' }}>
                      {text.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong>{text}</Text>
                      <div>
                        <Text type="secondary">{record.email}</Text>
                      </div>
                    </div>
                  </Space>
                )}
              />
              <Table.Column 
                title="Position" 
                dataIndex="position" 
                key="position" 
              />
              <Table.Column 
                title="Actions" 
                key="actions"
                render={(_, record: Candidate) => (
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />} 
                      size="small"
                      onClick={() => handleSendInvitation(record)}
                    >
                      Send Invitation
                    </Button>
                  </Space>
                )}
              />
            </Table>
          </Card>
        </Col>
        
        {selectedCandidate && (
          <>
            <Col span={24}>
              <div ref={setupCardRef}>
                <Card 
                  title="Interview Invitation Setup" 
                  variant="borderless"
                  extra={
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={toggleEmailEditMode}
                    >
                      {isEmailEditMode ? 'Preview Email' : 'Edit Email'}
                    </Button>
                  }
                >
                  <Alert
                    message={`Preparing interview invitation for ${selectedCandidate.name}`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Form layout="vertical">
                    <Form.Item label="Interview Type" name="interviewType">
                      <Radio.Group 
                        onChange={e => setInterviewType(e.target.value)}
                        value={interviewType}
                      >
                        <Space direction="vertical">
                          <Radio value="inperson">
                            <Space>
                              <UserOutlined />
                              <Text>In-person Interview</Text>
                            </Space>
                          </Radio>
                          <Radio value="video">
                            <Space>
                              <VideoCameraOutlined />
                              <Text>Video Interview</Text>
                            </Space>
                          </Radio>
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                    
                    <Divider>Available Time Slots</Divider>
                    
                    <Row gutter={[16, 16]}>
                      {timeSlots.map((slot) => (
                        <Col key={slot.id} xs={24} sm={12} md={8} lg={6}>
                          <Card 
                            size="small"
                            hoverable
                            style={{ borderColor: '#1677ff', borderRadius: '8px' }}
                            actions={[
                              <Button 
                                key="delete" 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteTimeSlot(slot.id)}
                              >
                                Delete
                              </Button>
                            ]}
                          >
                            <Card.Meta
                              avatar={<ClockCircleOutlined style={{ fontSize: '24px', color: '#1677ff' }} />}
                              title={
                                <div>
                                  <div>{slot.date} ({slot.weekday})</div>
                                  <div>{slot.time}</div>
                                </div>
                              }
                            />
                          </Card>
                        </Col>
                      ))}
                      
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card 
                          size="small"
                          hoverable
                          style={{ 
                            height: '100%', 
                            borderStyle: 'dashed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: '8px'
                          }}
                          onClick={handleAddTimeSlot}
                        >
                          <Space direction="vertical" align="center">
                            <PlusOutlined style={{ fontSize: '24px' }} />
                            <Text>Add Time Slot</Text>
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                    
                    {timeSlots.length === 0 && (
                      <Empty 
                        description="No time slots available. Add a time slot to continue." 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      />
                    )}
                    
                    <Divider>Email Preview</Divider>
                    
                    {!isEmailEditMode && (
                      <Alert 
                        message="System will send the following email template to candidates" 
                        type="info" 
                        showIcon 
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    {renderEmailPreview()}
                  </Form>
                </Card>
              </div>
            </Col>

            <Col span={24}>
              <Card variant="borderless">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleSubmit} 
                  disabled={timeSlots.length === 0}
                  block
                >
                  Send Interview Invitation
                </Button>
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Modal
        title="Select Interview Time Slot"
        open={isTimePickerOpen}
        onOk={handleTimePickerOk}
        onCancel={handleTimePickerCancel}
        okText="Add Time Slot"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Select Date (Weekdays Only)">
            <DatePicker 
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              disabledDate={disabledDate}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item label="Select Time Slot">
            <Select 
              style={{ width: '100%' }}
              value={selectedTime}
              onChange={(value) => setSelectedTime(value)}
            >
              {timeOptions.map(time => (
                <Option key={time} value={time}>{time}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 