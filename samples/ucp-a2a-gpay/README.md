<!--
   Copyright 2026 UCP Authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->

# Example Business Agent

An example Business A2A Agent that implements UCP Extension, with a chat client
to interact with it. Uses a mock in-memory RetailStore.

### Agent

See [business_agent/README.md](business_agent/README.md).

### Chat Client

See [chat-client/README.md](chat-client/README.md).

## Example interaction:

1. Launch the browser and navigate to http://localhost:3000/
2. In the Chat interface, type "show me cookies available in stock" and press
   enter.
3. The agent will return products available in stock.
4. Click 'Add to Checkout' for any product.
5. The agent will ask for required information such as email address, shipping
   address etc.
6. Once the required information is provided, click 'Complete Payment'.
7. The UI shows available mock payment options.
8. Select a payment method and click 'Confirm Purchase'.
9. The agent will create an order and return the order response.

### Disclaimer

This is an example implementation for demonstration purposes and is not
intended for production use.
