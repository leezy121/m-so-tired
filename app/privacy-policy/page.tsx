'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function PrivacyPolicyPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <BackgroundPaths title="Privacy Policy" />
      <Card className="w-full max-w-3xl relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-blue-500" />
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-2">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Pocket Option ID for account identification</li>
              <li>Email address for payment processing and communication</li>
              <li>Payment information processed securely through Selar</li>
              <li>Usage data and preferences for service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Provide and maintain our AI trading signal service</li>
              <li>Process payments and verify account access</li>
              <li>Send you updates, alerts, and important service notifications</li>
              <li>Improve and personalize your experience</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your personal information. 
              All payment processing is handled securely through Selar, and we do not store your 
              payment card details on our servers. Your Pocket Option ID and email are encrypted 
              and stored using SpacetimeDB with secure authentication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may 
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>With Selar for secure payment processing</li>
              <li>When required by law or to respond to legal processes</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use local storage and session data to maintain your login state and preferences. 
              We do not use third-party tracking cookies for advertising purposes. Essential 
              cookies are used only for authentication and service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Access and review your personal data</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. You may request account deletion at any time by 
              contacting our support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any 
              significant changes by posting the new policy on this page and updating the 
              &quot;Last Updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at:
            </p>
            <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-semibold">Email: support@tradingai.com</p>
              <p className="text-sm text-muted-foreground mt-1">
                We typically respond within 24-48 hours
              </p>
            </div>
          </section>

          <div className="pt-6 border-t">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
