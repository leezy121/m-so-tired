'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function TermsOfServicePage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <BackgroundPaths title="Terms of Service" />
      <Card className="w-full max-w-3xl relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-blue-500" />
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this AI Trading Signals application, you accept and agree to 
              be bound by these Terms of Service. If you do not agree to these terms, please do 
              not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
            <p className="text-muted-foreground mb-2">
              Our service provides:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>AI-generated trading signals based on technical analysis</li>
              <li>Real-time market data and trend analysis</li>
              <li>Technical indicators including RSI, MACD, Bollinger Bands, and EMAs</li>
              <li>Multi-market coverage across forex, crypto, commodities, and indices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Payment Terms</h2>
            <p className="text-muted-foreground mb-2">
              Access to our service requires a one-time payment of $3.00 USD:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Payment is processed securely through Selar</li>
              <li>Access is granted immediately upon successful payment verification</li>
              <li>All payments are final and non-refundable</li>
              <li>You may access the service anytime using your Pocket Option ID</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Risk Disclosure</h2>
            <div className="p-4 bg-amber-500/20 border-2 border-amber-500/60 rounded-lg">
              <p className="font-semibold text-amber-100 mb-2">⚠️ IMPORTANT TRADING RISKS:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-100/90 text-sm ml-4">
                <li>Trading involves substantial risk of loss</li>
                <li>Past performance does not guarantee future results</li>
                <li>Our signals have a 70-85% win rate but losses can occur</li>
                <li>Never invest more than you can afford to lose</li>
                <li>Always practice proper risk management</li>
                <li>This service is for educational purposes only</li>
                <li>We are not financial advisors and do not provide investment advice</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Responsibilities</h2>
            <p className="text-muted-foreground mb-2">
              As a user, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Provide accurate and up-to-date information</li>
              <li>Keep your Pocket Option ID confidential and secure</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not share your account access with others</li>
              <li>Conduct your own research before making trading decisions</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, algorithms, and technology used in this service are the intellectual 
              property of Trading AI App. You may not copy, modify, distribute, or reverse 
              engineer any part of our service without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-2">
              Our service is provided &quot;as is&quot; without warranties of any kind:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>We do not guarantee the accuracy of signals or market data</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>Technical indicators are based on historical data and patterns</li>
              <li>Market conditions can change rapidly and unpredictably</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Trading AI App shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages, including but not 
              limited to loss of profits, data, or trading losses, resulting from your use of or 
              inability to use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Service Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify, suspend, or discontinue any aspect of our service 
              at any time without prior notice. We may also update these Terms of Service 
              periodically, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your access to our service immediately, without prior 
              notice or liability, for any reason, including but not limited to breach of these 
              Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with applicable 
              international laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at:
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
