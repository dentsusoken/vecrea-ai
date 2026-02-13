/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference types="googlepay" />

//=============================================================================
// Configuration
//=============================================================================

/** The DOM element that the Google Pay button will be rendered into */
const GPAY_BUTTON_CONTAINER_ID = 'gpay-container';

/**
 * Update the `merchantId` and `merchantName` properties with your own values.
 * These fields are optional when the environment is `TEST`.
 * Get your merchant Id at https://goo.gle/3Cg8KxJ
 */
const merchantInfo = {
  merchantId: '12345678901234567890',
  merchantName: 'Example Merchant',
};

/**
 * Base configuration for all Google Pay requests.
 * This configuration will be cloned, modified, and used for all Google Pay requests.
 *
 * @see https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist
 * @see https://developers.google.com/pay/api/web/reference/request-objects
 */
const baseGooglePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'] as const,
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'] as const,
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey':
            'pk_test_51SwuqqLhRrbfZ6adrxNQ6xgZgphJGmf0hlEiiTYbn9V1cnbi7q8yS49NaBvjz6F9uM8ItOfvEurtq211Pzgh3k7V00l2rh6dHB',
        },
      },
    },
  ],
  merchantInfo,
};

// Prevent accidental edits to the base configuration.
Object.freeze(baseGooglePayRequest);

//=============================================================================
// Google payments client singleton
//=============================================================================

/** Google Payments Client instance. Initialized to null until created. */
let paymentsClient: google.payments.api.PaymentsClient | null = null;

/**
 * Gets an instance of the Google Payments Client.
 * Lazily initializes the client if it hasn't been created yet.
 */
function getGooglePaymentsClient(): google.payments.api.PaymentsClient {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST',
      merchantInfo,
    });
  }
  return paymentsClient;
}

//=============================================================================
// Helpers
//=============================================================================

/** Creates a deep copy of an object using JSON serialization. */
function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Renders the Google Pay button into the container specified by GPAY_BUTTON_CONTAINER_ID. */
function renderGooglePayButton(): void {
  const button = getGooglePaymentsClient().createButton({
    onClick: onGooglePaymentButtonClicked,
  });
  const container = document.getElementById(GPAY_BUTTON_CONTAINER_ID);
  if (container) {
    container.appendChild(button);
  }
}

//=============================================================================
// Event Handlers
//=============================================================================

/**
 * Google Pay API loaded handler.
 * Called when pay.js has finished loading. Checks if the user is ready to pay and renders the button.
 */
function onGooglePayLoaded(): void {
  const req = deepCopy(baseGooglePayRequest) as unknown as google.payments.api.IsReadyToPayRequest;

  getGooglePaymentsClient()
    .isReadyToPay(req)
    .then((res) => {
      if (res.result) {
        renderGooglePayButton();
      } else {
        console.log('Google Pay is not ready for this user.');
      }
    })
    .catch(console.error);
}

/**
 * Google Pay button click handler.
 * Loads payment data and sends the token to the backend.
 */
async function onGooglePaymentButtonClicked(): Promise<void> {
  const currency = 'JPY';
  const amount = String(Math.floor(Math.random() * 999) + 100);
  const req = {
    ...deepCopy(baseGooglePayRequest),
    transactionInfo: {
      countryCode: 'JP',
      currencyCode: currency,
      totalPriceStatus: 'FINAL' as const,
      totalPrice: amount,
    },
  } as unknown as google.payments.api.PaymentDataRequest;

  console.log('onGooglePaymentButtonClicked', req);

  getGooglePaymentsClient()
    .loadPaymentData(req)
    .then(async (res) => {
      console.log(res);
      const paymentToken = res.paymentMethodData.tokenizationData.token;

      const response = await fetch('http://localhost:3000/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_token: paymentToken,
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        console.error('Payment API error', response.status, await response.text());
      }
    })
    .catch(console.error);
}

/** Starts SSE connection to display payment result. */
function startResultSSE(): void {
  const resultEl = document.getElementById('result');
  if (!resultEl) return;

  const es = new EventSource('/sse/stripe');

  es.onmessage = (event: MessageEvent) => {
    resultEl.textContent = event.data;
  };

  es.addEventListener('payment-status', (event: Event) => {
    const data = JSON.parse((event as MessageEvent).data) as {
      status: string;
      paymentIntentId: string;
    };
    resultEl.textContent = `Payment: ${data.status} (pi=${data.paymentIntentId})`;
  });

  es.onerror = () => {
    console.warn('SSE error');
    resultEl.textContent = 'Disconnected. Reconnecting...';
  };
}

window.addEventListener('DOMContentLoaded', () => {
  startResultSSE();
});

// Expose for script tag onload in index.html
(window as Window & { onGooglePayLoaded: () => void }).onGooglePayLoaded = onGooglePayLoaded;
