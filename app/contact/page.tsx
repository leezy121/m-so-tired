'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Send, MessageSquare, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function ContactPage(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as { success?: boolean; message?: string; error?: string };

      if (response.ok && data.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 pt-16 md:pt-4">
      <BackgroundPaths title="Contact Us" />
      <Card className="w-full max-w-2xl relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl my-4">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
            <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
            <div>
              <CardTitle className="text-2xl sm:text-3xl">Contact Us</CardTitle>
              <CardDescription className="mt-1 sm:mt-2 text-sm">
                Have questions? We&apos;re here to help!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold mb-1 text-sm sm:text-base">Email Support</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">leezmike320@gmail.com</p>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1 text-sm sm:text-base">Response Time</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">24-48 hours</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Your Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
              <Input
                id="subject"
                type="text"
                placeholder="How can we help you?"
                value={formData.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, subject: e.target.value })
                }
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setFormData({ ...formData, message: e.target.value })
                }
                disabled={isSubmitting}
                rows={5}
                className="resize-none text-base min-h-[120px]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 sm:h-12 text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-2"
            >
              {isSubmitting ? (
                <>
                  <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                  <span className="text-sm sm:text-base">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Send Message</span>
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 sm:pt-6 border-t">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong className="font-semibold">Note:</strong> For payment-related issues, please include your Pocket Option ID 
                and email used during signup for faster resolution.
              </p>
            </div>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full h-11 text-sm sm:text-base"
            >
              <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
