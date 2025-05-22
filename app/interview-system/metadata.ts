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