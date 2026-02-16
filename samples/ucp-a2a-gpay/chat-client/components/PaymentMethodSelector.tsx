/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import {Checkout, PaymentMethod} from '../types';
import GooglePayButton from './GooglePayButton';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  onSelect: (selectedMethod: string) => void;
  onGooglePayComplete?: (token: string) => void;
  checkout?: Checkout | null;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onGooglePayComplete,
  checkout,
}) => {
  const totalTotal = checkout?.totals?.find((t) => t.type === 'total');
  const totalAmount = totalTotal
    ? (totalTotal.amount / 100).toFixed(2)
    : '100';
  const currencyCode = checkout?.currency ?? 'USD';

  if (!onGooglePayComplete) return null;

  return (
    <div className="max-w-md bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        Select a Payment Method
      </h3>
      <GooglePayButton
        onToken={onGooglePayComplete}
        totalAmount={totalAmount}
        currencyCode={currencyCode}
        countryCode="US"
      />
    </div>
  );
};

export default PaymentMethodSelector;
