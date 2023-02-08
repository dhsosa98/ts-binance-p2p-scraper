import { Page } from "playwright";

export function handleLoader(page: Page) {
    let loader;
    while (loader) {
        loader = page.locator(".css-14f6ssc").first();
    }
}