import { InterviewInvitation, Region, TimeSlot, InterviewType } from '../types/interview';

// Email templates for different regions
const REJECTION_TEMPLATES: Record<Region, { subject: string; body: string }> = {
  Shanghai: {
    subject: '面试结果通知',
    body: `尊敬的候选人：

感谢您参加我们的面试。经过慎重考虑，我们认为目前您的技能和经验与该职位的要求不太匹配。

祝您求职顺利！

此致`,
  },
  Taipei: {
    subject: '面試結果通知',
    body: `親愛的候選人：

感謝您參加我們的面試。經過審慎考慮，我們認為目前您的技能和經驗與該職位的要求不太匹配。

祝您求職順利！

此致`,
  },
  Japan: {
    subject: '面接結果のお知らせ',
    body: `応募者様：

面接にご参加いただき、ありがとうございました。慎重に検討させていただきましたが、残念ながら今回は採用を見送らせていただくことになりました。

今後のご活躍をお祈りしております。

敬具`,
  },
};

// Generate Google Calendar event
const createGoogleCalendarEvent = async (
  invitation: InterviewInvitation,
  timeSlot: TimeSlot
) => {
  // Implementation would use Google Calendar API
  const event = {
    summary: `Interview with ${invitation.candidate.name}`,
    description: `${invitation.type === 'video' ? 'Video' : 'On-site'} interview for ${invitation.candidate.position}`,
    start: {
      dateTime: `${timeSlot.date}T${timeSlot.start}:00`,
      timeZone: 'Asia/Shanghai',
    },
    end: {
      dateTime: `${timeSlot.date}T${timeSlot.end}:00`,
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
      text: `### 面试安排通知
- 候选人：${invitation.candidate.name}
- 职位：${invitation.candidate.position}
- 时间：${timeSlot.date} ${timeSlot.start}-${timeSlot.end}
- 类型：${invitation.type === 'video' ? '视频面试' : '现场面试'}
${invitation.type === 'video' ? `- 会议链接：${invitation.videoLink}` : ''}`,
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
  const subject = `Interview Invitation - ${invitation.candidate.position}`;
  const body = `Dear ${invitation.candidate.name},

You have been invited for a${invitation.type === 'video' ? ' video' : 'n on-site'} interview for the position of ${invitation.candidate.position}.

Time: ${timeSlot.date} ${timeSlot.start}-${timeSlot.end}
${invitation.type === 'video' ? `Meeting Link: ${invitation.videoLink}` : ''}

Best regards,`;

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