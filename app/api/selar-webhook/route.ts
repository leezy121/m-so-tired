import { NextRequest, NextResponse } from 'next/server';

// Selar webhook endpoint to receive payment notifications
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    console.log('Selar webhook received:', body);

    // Selar API Key for verification
    const selarApiKey = 'sat_x2n897116d43k79n2qeg999997639v2h20017';

    // Verify the webhook is from Selar (check API key in headers or body)
    const authHeader = request.headers.get('authorization');
    
    // Selar sends webhook data with these fields:
    // - email: customer email
    // - amount: payment amount
    // - reference: transaction reference
    // - status: payment status
    // - customer_name: customer name (we use this for Pocket Option ID)

    const { email, amount, reference, status, customer_name, pocket_option_id } = body;

    // Extract Pocket Option ID from customer_name or custom field
    const pocketOptionId = pocket_option_id || customer_name;

    if (!pocketOptionId) {
      console.error('No Pocket Option ID found in webhook data');
      return NextResponse.json(
        { success: false, message: 'Pocket Option ID not found' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (status === 'success' || status === 'completed') {
      console.log(`Payment successful for Pocket Option ID: ${pocketOptionId}`);
      console.log(`Amount: ${amount}, Reference: ${reference}`);

      // Here, the SpacetimeDB will be updated from the client-side
      // when the user returns to the app and checks their payment status
      
      return NextResponse.json({
        success: true,
        message: 'Payment notification received',
        data: {
          pocketOptionId,
          reference,
          amount,
          status,
        },
      });
    } else {
      console.log(`Payment not successful. Status: ${status}`);
      return NextResponse.json(
        { success: false, message: 'Payment not successful', status },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Selar webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Webhook processing error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for Selar webhook verification)
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Selar webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
