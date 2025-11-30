import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Logo } from './Logo';
import { useApp } from '../App';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Scale, UserCheck, CreditCard, Ban } from 'lucide-react';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155,77,255,0.12)',
  lightMagenta: 'rgba(255,77,145,0.12)',
  lightCoral: 'rgba(255,108,108,0.12)'
};

export function TermsOfServicePage() {
  const { setCurrentPage } = useApp();

  const containerGradient = `linear-gradient(135deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`;

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
            <Scale className="h-12 w-12" style={{ color: palette.violet }} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 text-lg">
            Last updated: November 2, 2025
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: palette.violet }} />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                By accessing and using Imtehaan.ai, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service constitute a legally binding agreement between you and Imtehaan.ai regarding your use of the platform, including all features, content, and services offered.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" style={{ color: palette.magenta }} />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Creation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must be at least 13 years old to create an account (parental consent required for users under 16)</li>
                  <li>One person or entity may maintain only one account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Do not share your account credentials with others</li>
                  <li>You may not transfer your account to another person</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" style={{ color: palette.coral }} />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>You agree to use Imtehaan.ai only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Share or distribute copyrighted content without authorization</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: palette.violet }} />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Our Content</h3>
                <p>
                  All content, features, and functionality on Imtehaan.ai, including but not limited to text, graphics, logos, software, and AI-generated content, are owned by Imtehaan.ai and protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                <p>
                  You retain ownership of content you submit to the platform. By submitting content, you grant us a worldwide, non-exclusive license to use, reproduce, and display your content solely for providing and improving our services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" style={{ color: palette.magenta }} />
                Payment and Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>You can cancel your subscription at any time</li>
                <li>Payment information is processed securely through third-party providers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" style={{ color: palette.coral }} />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Imtehaan.ai is provided "as is" without warranties of any kind. To the fullest extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid in the last 12 months</li>
                <li>AI-generated content is for educational purposes and may contain errors</li>
                <li>We are not responsible for exam results or academic outcomes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" style={{ color: palette.violet }} />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in conduct that we deem harmful to the platform or other users. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your right to use the platform will immediately cease</li>
                <li>We may delete your account and data after a grace period</li>
                <li>You may request a data export before account deletion</li>
                <li>Paid subscriptions will not be refunded unless required by law</li>
              </ul>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with applicable international laws. Any disputes arising from these Terms shall be resolved through binding arbitration.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card
            className="border"
            style={{
              background: `linear-gradient(135deg, ${palette.lightViolet}, rgba(255,255,255,0.95))`,
              borderColor: 'rgba(155,77,255,0.25)'
            }}
          >
            <CardContent className="py-6">
              <h3 className="font-semibold text-gray-900 mb-3">Questions About These Terms?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> <a href="mailto:legal@imtehaan.ai" className="hover:underline" style={{ color: palette.violet }}>legal@imtehaan.ai</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@imtehaan.ai" className="hover:underline" style={{ color: palette.magenta }}>support@imtehaan.ai</a></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Button */}
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

