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

Example agent implementing A2A Extension for UCP

### Pre-requisites:

1. Python 3.13
2. UV
3. Gemini API Key (The agent uses Gemini model to generate responses)

## Quick Start

1. Clone the Vecrea AI repository.
   `git clone https://github.com/dentsusoken/vecrea-ai`
2. `cd vecrea-ai/samples/ucp-a2a-gpay/business_agent`
3. Run `uv sync`
4. Update the env.example file with your Gemini API key and rename it to .env
   . Run `uv run business_agent`
5. This starts the business agent on port 10999. You can verify by accessing
   the agent card at http://localhost:10999/.well-known/agent-card.json
6. The business agent's UCP Profile can be found at
   http://localhost:10999/.well-known/ucp
