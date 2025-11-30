import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Logo } from './Logo';
import { useApp } from '../App';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell, Cookie, FileText } from 'lucide-react';
import { Separator } from './ui/separator';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155,77,255,0.12)',
  lightMagenta: 'rgba(255,77,145,0.12)',
  lightCoral: 'rgba(255,108,108,0.12)'
};

export function PrivacyPolicyPage() {
  const { setCurrentPage } = useApp();

  const containerGradient = `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`;
  const headerGradient = `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta})`;

  return (
    <div className="min-h-screen" style={{ background: containerGradient }}>
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50" style={{ borderColor: 'rgba(155,77,255,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" showText={true} />
            <Button 
              variant="ghost" 
              onClick={() => setCurrentPage('landing')}
              className="text-black hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12" style={{ color: palette.violet }} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">
            Last updated: November 2, 2025
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: palette.violet }} />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Welcome to Imtehaan.ai ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered educational platform.
              </p>
              <p>
                By using Imtehaan.ai, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" style={{ color: palette.magenta }} />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Educational information (grade level, curriculum, subjects)</li>
                  <li>Account credentials (encrypted passwords)</li>
                  <li>Profile preferences and settings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Learning Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Study sessions and practice activity</li>
                  <li>Question responses and exam submissions</li>
                  <li>Performance metrics and progress tracking</li>
                  <li>AI tutor conversation history</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Technical Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" style={{ color: palette.coral }} />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Educational Services:</strong> To provide personalized learning experiences, AI tutoring, and grading services</li>
                <li><strong>Account Management:</strong> To create and maintain your account, process authentication, and manage your preferences</li>
                <li><strong>Performance Tracking:</strong> To monitor your progress, generate analytics, and provide performance insights</li>
                <li><strong>Service Improvement:</strong> To enhance our AI models, improve user experience, and develop new features</li>
                <li><strong>Communication:</strong> To send important updates, notifications, and educational content</li>
                <li><strong>Security:</strong> To protect against fraud, unauthorized access, and ensure platform security</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" style={{ color: palette.violet }} />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data transmission</li>
                <li>Secure password hashing using bcrypt</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Row-level security policies in our database</li>
                <li>Secure API authentication with JWT tokens</li>
                <li>HTTPS/SSL encryption for all communications</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: palette.magenta }} />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We do not sell your personal information. We may share your data only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party services (e.g., OpenAI for AI tutoring, Supabase for database hosting) under strict data protection agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation</li>
                <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of Imtehaan.ai, our users, or others</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition (with notice to you)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" style={{ color: palette.coral }} />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we use your data</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@imtehaan.ai" className="hover:underline" style={{ color: palette.violet }}>privacy@imtehaan.ai</a>
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" style={{ color: palette.violet }} />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, though this may limit some functionality.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our platform is designed for students of various ages. For users under 16 years old, we require parental consent. We are committed to complying with the Children's Online Privacy Protection Act (COPPA) and similar regulations worldwide.
              </p>
            </CardContent>
          </Card>

          {/* Updates to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card
            className="border"
            style={{
              background: `linear-gradient(135deg, ${palette.lightViolet}, rgba(255,255,255,0.95))`,
              borderColor: 'rgba(155,77,255,0.25)'
            }}
          >
            <CardContent className="py-6">
              <h3 className="font-semibold text-gray-900 mb-3">Questions About Privacy?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> <a href="mailto:privacy@imtehaan.ai" className="hover:underline" style={{ color: palette.violet }}>privacy@imtehaan.ai</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@imtehaan.ai" className="hover:underline" style={{ color: palette.magenta }}>support@imtehaan.ai</a></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => setCurrentPage('landing')}
            className="text-white"
            style={{ background: '#000000' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

