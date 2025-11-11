import { NextResponse } from 'next/server';
import { storefrontGraphQL } from '@/lib/shopify';

const CUSTOMER_CREATE_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function POST(request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    const data = await storefrontGraphQL(CUSTOMER_CREATE_MUTATION, {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    });

    if (data.customerCreate.customerUserErrors.length > 0) {
      const errors = data.customerCreate.customerUserErrors;
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data.customerCreate.customer,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
