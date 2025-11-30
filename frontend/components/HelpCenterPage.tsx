import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Logo } from './Logo';
import { useApp } from '../App';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  HelpCircle, 
  CreditCard, 
  Settings, 
  Lock, 
  GraduationCap,
  MessageCircle,
  ChevronRight,
  Video,
  FileText,
  Zap,
  Users
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const palette = {
  violet: '#9B4DFF',
  magenta: '#FF4D91',
  coral: '#FF6C6C',
  lightViolet: 'rgba(155, 77, 255, 0.1)',
  lightMagenta: 'rgba(255, 77, 145, 0.1)',
  lightCoral: 'rgba(255, 108, 108, 0.1)'
};

export function HelpCenterPage() {
  const { setCurrentPage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      color: palette.violet,
      bgColor: palette.lightViolet,
      articles: 5
    },
    {
      icon: GraduationCap,
      title: 'Using the Platform',
      color: palette.magenta,
      bgColor: palette.lightMagenta,
      articles: 8
    },
    {
      icon: CreditCard,
      title: 'Billing & Payments',
      color: palette.coral,
      bgColor: palette.lightCoral,
      articles: 4
    },
    {
      icon: Lock,
      title: 'Account & Security',
      color: palette.violet,
      bgColor: palette.lightViolet,
      articles: 6
    },
    {
      icon: MessageCircle,
      title: 'AI Tutor',
      color: palette.magenta,
      bgColor: palette.lightMagenta,
      articles: 7
    },
    {
      icon: Settings,
      title: 'Troubleshooting',
      color: palette.coral,
      bgColor: palette.lightCoral,
      articles: 5
    }
  ];

  const faqs = [
    {
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" in the navigation menu, fill in your details including name, email, and password. Choose your curriculum (IGCSE, A-Levels, IB, etc.) and subjects. Once registered, you can immediately start using all platform features.'
    },
    {
      category: 'Getting Started',
      question: 'What subjects are available?',
      answer: 'We currently offer comprehensive coverage for Business Studies with plans to expand to Mathematics, Physics, Chemistry, Biology, and more. Each subject includes practice questions, mock exams, video lessons, and AI tutoring support.'
    },
    {
      category: 'Using the Platform',
      question: 'How does the AI Tutor work?',
      answer: 'Our AI Tutor uses advanced GPT-4 technology to provide personalized explanations, answer your questions, and generate custom lessons. Simply select a topic, ask your question, and receive detailed, context-aware responses with examples and practice questions.'
    },
    {
      category: 'Using the Platform',
      question: 'How are my answers graded?',
      answer: 'We use an AI-powered grading system that analyzes your answers based on content accuracy, structure, business terminology, critical thinking, and use of examples. You receive detailed feedback, a score out of 50, percentage, letter grade, and specific suggestions for improvement.'
    },
    {
      category: 'Using the Platform',
      question: 'Can I track my progress?',
      answer: 'Yes! The Analytics dashboard provides comprehensive insights including study time, questions answered, accuracy rates, study streaks, weak areas, and improvement trends. You can view daily, weekly, and monthly progress reports.'
    },
    {
      category: 'Billing & Payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal. All payments are processed securely through industry-standard payment gateways.'
    },
    {
      category: 'Billing & Payments',
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. No refunds are provided for partial months.'
    },
    {
      category: 'Account & Security',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the link to create a new password. The link expires after 24 hours for security.'
    },
    {
      category: 'Account & Security',
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Passwords are hashed using bcrypt. We implement Row-Level Security in our database and conduct regular security audits.'
    },
    {
      category: 'AI Tutor',
      question: 'What topics can the AI Tutor help with?',
      answer: 'The AI Tutor covers all Business Studies topics including Marketing, Finance, Human Resources, Operations, and Business Strategy. It can explain concepts, provide examples, answer questions, and generate practice problems.'
    },
    {
      category: 'AI Tutor',
      question: 'Can I save my AI Tutor conversations?',
      answer: 'Yes! All your conversations are automatically saved in your account. You can access previous discussions from the AI Tutor page and export conversations for offline review.'
    },
    {
      category: 'Troubleshooting',
      question: 'The platform is running slowly. What should I do?',
      answer: 'Try these steps: 1) Clear your browser cache and cookies, 2) Disable browser extensions, 3) Try a different browser (Chrome recommended), 4) Check your internet connection, 5) Contact support if the issue persists.'
    },
    {
      category: 'Troubleshooting',
      question: 'I can\'t log in to my account',
      answer: 'First, ensure you\'re using the correct email and password. Try resetting your password using "Forgot Password". Clear browser cookies and cache. If still unable to login, contact support@imtehaan.ai with your account email.'
    }
  ];

  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-teal-light/20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-12 w-12" style={{ color: palette.violet }} />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Help Center</h1>
          <p className="text-black text-lg max-w-2xl mx-auto mb-8">
            Find answers to common questions and learn how to make the most of Imtehaan.ai
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: palette.magenta }} />
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 rounded-xl focus:border-[#9B4DFF] focus:ring-2 focus:ring-[#9B4DFF]/20"
                style={{ 
                  borderColor: searchQuery ? palette.violet : '#E5E7EB'
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-200" style={{ backgroundColor: category.bgColor }}>
                      <category.icon className="h-6 w-6" style={{ color: category.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-black mb-1">{category.title}</h3>
                      <p className="text-sm text-black">{category.articles} articles</p>
                    </div>
                    <ChevronRight className="h-5 w-5 transition-colors duration-200" style={{ color: category.color }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">
            Frequently Asked Questions
            {searchQuery && ` (${filteredFaqs.length} results)`}
          </h2>
          
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const categoryColors = [
                  palette.violet,
                  palette.magenta,
                  palette.coral,
                  palette.violet,
                  palette.magenta,
                  palette.coral
                ];
                const categoryColor = categoryColors[index % categoryColors.length];
                return (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="text-left">
                      <span className="text-xs font-medium" style={{ color: categoryColor }}>{faq.category}</span>
                      <p className="text-black font-medium mt-1">{faq.question}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-black leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4" style={{ color: palette.magenta }} />
                <p className="text-black">No results found for "{searchQuery}"</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                  style={{ color: palette.violet }}
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Still Need Help */}
        <Card className="mt-12" style={{ 
          background: `linear-gradient(90deg, ${palette.lightViolet}, ${palette.lightMagenta}, ${palette.lightCoral})`,
          borderColor: palette.violet
        }}>
          <CardContent className="py-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" style={{ color: palette.violet }} />
            <h3 className="text-2xl font-bold text-black mb-2">Still Need Help?</h3>
            <p className="text-black mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions or issues.
            </p>
            <Button 
              onClick={() => setCurrentPage('contact-support')}
              className="text-white"
              style={{ background: '#000000' }}
            >
              Contact Support
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

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

