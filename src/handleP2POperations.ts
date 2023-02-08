import { WindowsToaster } from "node-notifier";
import { Page } from "playwright";
import { handleLoader } from "./loader";
import { sender } from "./nodemailer";
import { createTemplate } from "./template";
import { logger } from "./utils";

type HandleOperations = {
  page: Page;
  disableNotifications: boolean;
  fiat: string;
  minOperationLimit: number;
  price: number;
  maxOperationLimit: number;
  paymentMethods: string[];
  tradeMethod: string;
  crypto: string;
  untilPage: number;
  url: string;
};

interface Operation {
  price: string;
  minLimit: string;
  maxLimit: string;
  paymentMethods: string[];
  tradeMethod: string;
  fiat: string;
  crypto: string;
}

export async function handleP2POperations({
  page,
  fiat,
  minOperationLimit = 0,
  maxOperationLimit = Infinity,
  price,
  disableNotifications=false,
  paymentMethods,
  tradeMethod,
  untilPage = 1,
  crypto,
  url,
}: HandleOperations) {
  let operationsPaymentMehods: string[][] = [];
  let prices: string[] = [];
  let minLimits: number[] = [];
  let maxsLimits: number[] = [];

  let operations: Operation[] = [];

  let currentPage = 1;

  while (currentPage <= untilPage) {
    let limits: unknown[] = [];

    const allP2P = page.locator(".css-1mf6m87");

    while (limits.length === 0) {
      limits = await allP2P.locator(".css-4cffwv").allInnerTexts();
    }

    logger("Limits: ", limits);

    let tempPrices: string[] = [];

    while (tempPrices.length === 0) {
      tempPrices = await allP2P.locator(".css-1m1f8hn").allInnerTexts();
    }

    prices.push(...tempPrices);

    let tempOperationsPaymentMehods: string[] = [];

    while (tempOperationsPaymentMehods.length === 0) {
      tempOperationsPaymentMehods = await allP2P
        .locator(".css-tlcbro")
        .allInnerTexts();
    }

    let mapOperationsPaymentMehods = tempOperationsPaymentMehods.map(
      (elem: string) => {
        return elem.split("\n").map((elem: string) => elem.toLowerCase());
      }
    );

    operationsPaymentMehods.push(...mapOperationsPaymentMehods);

    const limitsParsed = limits.map((limit: string) =>
      Number(limit.replace(/[^0-9.-]+/g, ""))
    );

    limitsParsed.forEach((elem: number, index: number) => {
      if (index % 2 === 0) {
        minLimits.push(elem);
      } else {
        maxsLimits.push(elem);
      }
    });

    await page.locator(`#page-${currentPage + 1}`).click();

    handleLoader(page);

    currentPage += 1;
  }

  logger("prices: ", prices);
  logger("mins: ", minLimits);
  logger("maxs: ", maxsLimits);

  minLimits.forEach((min: number, index: number) => {
    const includesPaymentMethods = operationsPaymentMehods[index].some(
      (operationPaymentMethod: string) =>
        paymentMethods.includes(operationPaymentMethod)
    );
    const condition =
      min >= minOperationLimit &&
      maxsLimits[index] <= maxOperationLimit &&
      (includesPaymentMethods ||
        !paymentMethods ||
        paymentMethods[0] === "all");
    if (condition) {
      operations.push({
        price: prices[index],
        minLimit: String(min),
        maxLimit: String(maxsLimits[index]),
        paymentMethods: operationsPaymentMehods[index],
        tradeMethod,
        fiat,
        crypto,
      });
    }
  });

  logger("operations: ", operations);

  if (operations.length === 0) {
    logger("NO MATCH");
    return;
  }

  const [firstMin, firstMax, firstPaymentMethods, firstPrice] = [
    operations[0].minLimit,
    operations[0].maxLimit,
    operations[0].paymentMethods,
    operations[0].price,
  ];

  let condition = Number(firstPrice) >= price;
  if (tradeMethod === "sell") {
    condition = Number(firstPrice) < price;
  }

  if (condition) {
    logger("NO MATCH, THE PRICE IS: ", firstPrice);
    return;
  }

  if (disableNotifications) {
    return;
  }

  const firstResults = operations.map((operation: Operation) => {
    const { price, minLimit, maxLimit, paymentMethods, fiat } = operation;
    return `Precio de ${price} ${fiat} con mínimo de ${minLimit} ${fiat} y máximo de ${maxLimit} ${fiat} con los métodos de pago ${paymentMethods.join(
      ", "
    )}`;
  });

  const title = `PRECIO DE ${firstPrice} ${fiat} PARA LA ${tradeMethod === "sell" ? "VENTA" : "COMPRA"
    } de la criptomoneda ${crypto}!!`;
  const message = `Se detectó un precio de ${firstPrice} ${fiat} con los métodos de pago ${firstPaymentMethods.join(
    ", "
  )} en la página de Binance P2P con una cantidad mínima de ${firstMin} ${fiat} y máxima de ${firstMax} ${fiat}`;

  const cid = "bot@cid.ee";

  const date = new Date().toLocaleString("es-AR", {
    timeZone: "America/Buenos_Aires",
  });

  const html = createTemplate({
    title,
    message,
    date,
    firstResults,
    url,
    cid,
  });

  new WindowsToaster({
    withFallback: true,
  }).notify({
    icon: "./icon.png",
    title,
    message,
  });
  await sender({
    subject: title,
    html: html,
    attachments: [
      {
        filename: "icon.png",
        path: "./icon.png",
        cid,
      },
    ],
  });
  logger("Email sent");
}
