import { BINANCE_DATA_TYPE } from "./scraper";


export const validateAndTransformData = ({
    BINANCE_P2P_FIAT,
    BINANCE_P2P_MAX_PRICE,
    BINANCE_P2P_CRYPTO,
    BINANCE_P2P_PAYMENT_METHODS,
    BINANCE_P2P_TRADE_METHOD,
    BINANCE_P2P_MAX_OPERATION_LIMIT,
    BINANCE_P2P_MIN_OPERATION_LIMIT,
    BINANCE_P2P_UNTIL_PAGE,
}: BINANCE_DATA_TYPE) => {
    // Set the default values
    const fiat = BINANCE_P2P_FIAT;
    let price = BINANCE_P2P_MAX_PRICE;
    let paymentMethods = BINANCE_P2P_PAYMENT_METHODS;
    const tradeMethod = BINANCE_P2P_TRADE_METHOD;
    let minOperationLimit = BINANCE_P2P_MIN_OPERATION_LIMIT;
    let maxOperationLimit = BINANCE_P2P_MAX_OPERATION_LIMIT;
    const crypto = BINANCE_P2P_CRYPTO;
    let untilPage = BINANCE_P2P_UNTIL_PAGE;

    if (!fiat || !crypto) {
        throw new Error("Fiat and crypto are required");
    }

    if (tradeMethod !== "buy" && tradeMethod !== "sell") {
        throw new Error("Trade method must be buy or sell");
    }

    if (!price) {
        if (tradeMethod === "buy") {
            price = Infinity;
        } else {
            price = 0;
        }
    }

    if (!untilPage) {
        untilPage = 1;
    }

    if (!minOperationLimit) {
        minOperationLimit = 0;
    }

    if (!maxOperationLimit) {
        maxOperationLimit = Infinity;
    }

    if (typeof paymentMethods === "string") {
        throw new Error("Payment Methods must be an array");
    }

    paymentMethods = paymentMethods.map((paymentMethod) => {
        return paymentMethod.toLowerCase();
    });

    let url = `https://p2p.binance.com/es/trade/${paymentMethods.join(
        ","
    )}/${crypto}?fiat=${fiat}`;

    if (tradeMethod === "sell") {
        url = `https://p2p.binance.com/es/trade/sell/${crypto}?fiat=${fiat}&payment=${paymentMethods.join(
            ","
        )}`;
    }

    return {
        url,
        price,
        paymentMethods,
        tradeMethod,
        minOperationLimit,
        maxOperationLimit,
        crypto,
        fiat,
        untilPage,
    };
};