FROM node:20-slim

RUN apt-get update
RUN apt-get install -y \
    git \
    curl \
    lsof \
    python3 \
    make \
    g++ \
    gpg

# stripe のインストール
RUN curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | tee /usr/share/keyrings/stripe.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | tee -a /etc/apt/sources.list.d/stripe.list
RUN apt-get update
RUN apt-get install stripe

RUN rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest
