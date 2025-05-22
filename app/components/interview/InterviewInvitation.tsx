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