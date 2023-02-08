## TS P2P BINANCE SCRAPER

This is a simple scraper for the Binance P2P trading platform. It is written in Typescript and uses Playwright to scrape the data.

### Features

- Scrape all offers for a specific payment method, currency, currency pair, price and amount range

### Requirements

- NodeJS
- NPM

### Installation

```bash
npm install
```
### Configuration

The configuration is done in the `config.json` file. The following options are available:

```json
// Available options
{
    "BINANCE_P2P_FIAT": "ARS",
    "BINANCE_P2P_MAX_PRICE": 360,
    "BINANCE_P2P_CRYPTO": "USDT",
    "BINANCE_P2P_PAYMENT_METHODS": ["Naranja X", "Mercadopago", "Lemon", "Belo", "Uala"],
    "BINANCE_P2P_TRADE_METHOD": "sell", 
    "BINANCE_P2P_MIN_OPERATION_LIMIT": 5000,
    "BINANCE_P2P_MAX_OPERATION_LIMIT": 10000,
    "BINANCE_P2P_UNTIL_PAGE": 5,
    "DISABLE_NOTIFICATIONS": true,
    "CRON_TIME": "15,45 * * * * *"
}
```

Also you can set the environment variables with the .env file using .env.example as example:

```bash
# nodemailer
TO=
SERVICE=
USER=

# Google Api
GOOGLE_REFRESH_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```	

### Usage

```bash
npm run dev
```

### Cron

You can set a cron job to run the scraper every X minutes. To do so, you need to set the `CRON_TIME` variable in the `data.json` file. For example, to run the scraper every 30 minutes, you need to set the `CRON_TIME` variable to `0,30 * * * * *`.

### Notifications

You can set the `DISABLE_NOTIFICATIONS` variable to `false` to enable notifications. The notifications are sent via email using Nodemailer. You need to set the `TO` variable with the email address you want to send the notifications to. Also, you need to set the `SERVICE`, `USER`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` variables with the email service, user, refresh token, client id and client secret respectively.





