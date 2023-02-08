import { Page } from "playwright";
import { handleLoader } from "./loader";
import { logger } from "./utils";

type SelectPaymentMethod = {
    page: Page;
    paymentMethod: string;
};

export async function selectPaymentMethod({
    page,
    paymentMethod,
}: SelectPaymentMethod) {
    const paymentsMethodsButton = page
        .locator("#C2Cpaymentfilter_searchbox_payment")
        .first();
    await paymentsMethodsButton.click();
    logger("payments methods button clicked");

    const paymentsMethodsInput = paymentsMethodsButton.locator(".css-jl5e70");
    await paymentsMethodsInput.fill(paymentMethod);
    logger(paymentMethod + " selected");

    await paymentsMethodsInput.press("Enter");
    logger("payments methods button Enter clicked");
    
    handleLoader(page)
}
