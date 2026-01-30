import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as ContactFormData;
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send email via Web3Forms (Free email service)
    try {
      const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // Get free key from https://web3forms.com
          from_name: name,
          email: email,
          subject: `Trading AI Support: ${subject}`,
          message: `From: ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`,
          to: 'leezmike320@gmail.com',
          replyto: email
        })
      });

      const result = await web3formsResponse.json() as { success?: boolean; message?: string };

      if (!web3formsResponse.ok || !result.success) {
        console.error('Web3Forms error:', result);
        return NextResponse.json(
          { error: 'Failed to send email. Please try again or contact us directly at leezmike320@gmail.com' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: 'Your message has been sent successfully! We will get back to you soon.' 
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please contact us directly at leezmike320@gmail.com' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}
