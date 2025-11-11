import { NextResponse } from 'next/server';
import { storefrontGraphQL } from '@/lib/shopify';

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
    }
  }
`;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const tokenData = await storefrontGraphQL(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
      input: { email, password },
    });

    if (tokenData.customerAccessTokenCreate.customerUserErrors.length > 0) {
      const errors = tokenData.customerAccessTokenCreate.customerUserErrors;
      return NextResponse.json(
        { error: errors[0].message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const accessToken = tokenData.customerAccessTokenCreate.customerAccessToken.accessToken;

    const customerData = await storefrontGraphQL(CUSTOMER_QUERY, {
      customerAccessToken: accessToken,
    });

    return NextResponse.json({
      accessToken,
      customer: customerData.customer,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
