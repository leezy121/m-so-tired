import { NextRequest, NextResponse } from 'next/server';

// API endpoint to verify Selar payment manually
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Selar API Key
    const selarApiKey = 'sat_x2n897116d43k79n2qeg999997639v2h20017';

    // Call Selar API to fetch transactions for this email
    // Selar API endpoint: https://api.selar.com/v1/transactions
    const selarApiUrl = 'https://api.selar.com/v1/transactions';

    const response = await fetch(selarApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${selarApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Selar API error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch payment data from Selar' },
        { status: 500 }
      );
    }

    const selarData = await response.json();
    console.log('Selar API response:', selarData);

    // Look for a transaction matching the email
    // Selar typically returns { data: [...transactions], meta: {...} }
    const transactions = selarData.data || [];

    // Find a successful transaction for this email with amount 400000 (₦4,000 in kobo)
    const matchingTransaction = transactions.find((txn: Record<string, unknown>) => {
      const txnEmail = txn.customer_email as string || txn.email as string;
      const txnAmount = txn.amount as number;
      const txnStatus = txn.status as string;
      
      return (
        txnEmail?.toLowerCase() === email.toLowerCase() &&
        txnAmount === 400000 && // ₦4,000 = 400000 kobo
        (txnStatus === 'success' || txnStatus === 'completed')
      );
    });

    if (matchingTransaction) {
      // Extract Pocket Option ID from the transaction
      // We stored it as customer_name or in a custom field
      const pocketOptionId = 
        (matchingTransaction.pocket_option_id as string) || 
        (matchingTransaction.customer_name as string) || 
        (matchingTransaction.name as string) || 
        '';

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          reference: matchingTransaction.reference as string,
          amount: matchingTransaction.amount as number,
          pocketOptionId,
          customerName: matchingTransaction.customer_name as string || matchingTransaction.name as string,
          email: matchingTransaction.customer_email as string || matchingTransaction.email as string,
          status: matchingTransaction.status as string,
        },
      });
    } else {
      // No matching transaction found
      return NextResponse.json(
        {
          success: false,
          message: 'No verified payment found for this email. Please ensure you completed the ₦4,000 payment.',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Verification error. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
