import { Page } from "playwright";
import { handleLoader } from "./loader";
import { logger } from "./utils";

type SelectFiat = {
    page: Page;
    fiat: string;
};

export async function selectFiat({ page, fiat }: SelectFiat) {
    const fiatButton = page.locator("#C2Cfiatfilter_searhbox_fiat").first();
    await fiatButton.click();
    logger("fiat button clicked");

    const fiatInput = page.locator(".css-jl5e70").first();
    await fiatInput.fill(fiat);
    logger(fiat + " selected");

    await fiatInput.press("Enter");
    logger("fiat button clicked");

    handleLoader(page)
}
