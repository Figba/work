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