import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Logo } from './Logo';
import { useApp } from '../App';
import { ArrowLeft, Mail, MessageCircle, Phone, MapPin, Send, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ContactSupportPage() {
  const { setCurrentPage } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <MessageCircle className="h-12 w-12 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-4">Contact Support</h1>
          <p className="text-black text-lg max-w-2xl mx-auto">
            Have questions or need help? We're here for you 24/7. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitSuccess && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Message sent successfully! We'll get back to you within 24 hours.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="account">Account & Login</SelectItem>
                        <SelectItem value="content">Content & Questions</SelectItem>
                        <SelectItem value="ai-tutor">AI Tutor</SelectItem>
                        <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your question or issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-white"
                    style={{ background: '#000000' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email Support */}
            <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Mail className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Email Support</h3>
                    <p className="text-sm text-black mb-2">Available 24/7</p>
                    <a href="mailto:support@imtehaan.ai" className="text-teal-600 hover:underline text-sm font-medium">
                      support@imtehaan.ai
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Response Time</h3>
                    <p className="text-sm text-black">
                      We typically respond within 24 hours during business days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Quick Help</h3>
                    <p className="text-sm text-black mb-3">
                      Check our Help Center for instant answers
                    </p>
                    <Button 
                      size="sm"
                      onClick={() => setCurrentPage('help-center')}
                      className="text-xs text-white"
                      style={{ background: '#000000' }}
                    >
                      View Help Center
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-black mb-3">Support Hours</h3>
                <div className="space-y-2 text-sm text-black">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday:</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Email support available 24/7
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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

