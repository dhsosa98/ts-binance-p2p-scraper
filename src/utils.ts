export const sleep = (m: number) => new Promise((r) => setTimeout(r, m));

export const logger = (...msg: unknown[]) => console.log(...msg);