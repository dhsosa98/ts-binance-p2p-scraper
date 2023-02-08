import { chromium } from "playwright";
import cron from "node-cron";
import * as fs from "fs";
import * as dotenv from 'dotenv'
import { logger, sleep } from "./utils";
import { selectFiat } from "./selectFiat";
import { selectPaymentMethod } from "./selectPaymentMethod";
import { handleP2POperations } from "./handleP2POperations";
import { validateAndTransformData } from "./validations";
import { handleLoader } from "./loader";
dotenv.config()


export type BINANCE_DATA_TYPE = {
  BINANCE_P2P_FIAT: string;
  BINANCE_P2P_CRYPTO: string;
  BINANCE_P2P_MAX_PRICE: number;
  BINANCE_P2P_PAYMENT_METHODS: string[];
  BINANCE_P2P_TRADE_METHOD: string;
  BINANCE_P2P_MIN_OPERATION_LIMIT: number;
  BINANCE_P2P_MAX_OPERATION_LIMIT: number;
  BINANCE_P2P_UNTIL_PAGE: number;
  CRON_TIME: string;
  DISABLE_NOTIFICATIONS: boolean;
};


async function scraper() {
  // Create a browser context
  const browser = await chromium.launch();

  logger("browser launched");

  // Create a page in a pristine context.
  const page = await browser.newPage();

  // Obtain the operation data from the config.json file
  const rawdata = fs.readFileSync("./config.json", "utf8");

  let binanceData: BINANCE_DATA_TYPE = JSON.parse(rawdata);

  // Set the cron schedule
  const cronSchedule = binanceData.CRON_TIME || "15,30,45 * * * * *";

  cron.schedule(cronSchedule, async () => {
    logger(
      `Running on: ${new Date().toLocaleString("es-AR", {
        timeZone: "America/Buenos_Aires",
      })}`
    );

    const rawdata = fs.readFileSync("./config.json", "utf8");

    binanceData = JSON.parse(rawdata);

    const { DISABLE_NOTIFICATIONS: disableNotifications } = binanceData;

    // Validate the data
    const {
      url,
      price,
      paymentMethods,
      tradeMethod,
      minOperationLimit,
      maxOperationLimit,
      crypto,
      fiat,
      untilPage,
    } = validateAndTransformData(binanceData);

    logger("page opened");
    await page.goto(url);
    logger("page loaded: ", url);

    const pageContent = await page.content();

    if (pageContent.includes("css-1pcqseb")) {
      await page.click(".css-1pcqseb");
      logger("x button clicked");
    }

    handleLoader(page);

    await selectFiat({ page, fiat });
    await sleep(1000);

    if (paymentMethods.length === 1) {
      const paymentMethod = paymentMethods[0];
      await selectPaymentMethod({ page, paymentMethod });
      await sleep(500);
    }

    await handleP2POperations({
      page,
      fiat,
      price,
      paymentMethods,
      tradeMethod,
      crypto,
      minOperationLimit,
      untilPage,
      maxOperationLimit,
      disableNotifications,
      url,
    });

    await page.reload();
    await sleep(500);

    handleLoader(page);

    await sleep(500);
  });
}

scraper();
