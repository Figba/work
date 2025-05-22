'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import { LanguageProvider } from "./context/LanguageContext";
import "./globals.css";

// 使用display:swap优化字体加载
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 增强的主题色，提高可访问性
  const enhancedPrimaryColor = "#0958d9";
  
  return (
    <html lang="en">
      <head>
        <title>Enterprise System Prototype</title>
        <meta name="description" content="Enterprise system prototype built with Next.js and Ant Design" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="enterprise system, prototype, next.js, ant design" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Enterprise System Prototype" />
        <meta property="og:description" content="Enterprise system prototype built with Next.js and Ant Design" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Enterprise System" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: enhancedPrimaryColor,
                colorBgContainer: "#ffffff", 
                colorBgElevated: "#ffffff",
                colorTextSecondary: "#434343", // 增加次要文本颜色对比度
                fontSize: 14,
                borderRadius: 4,
              },
              algorithm: theme.defaultAlgorithm,
            }}
          >
            <AntdApp>{children}</AntdApp>
          </ConfigProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
