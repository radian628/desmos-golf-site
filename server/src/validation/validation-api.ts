import puppeteer from "puppeteer";
import { debugPrint } from "../server.js";

export type ValidationAPI = {
  getGraphStateLength: (graphLink: string) => Promise<number | undefined>;
  getTextModeLength: (graphLink: string) => Promise<number | undefined>;
  validateThatGraphPassesTestSuite: (opts: {
    graphLink: string;
    challengeID: number;
  }) => Promise<boolean | undefined>;
};

export function dummyValidationAPI(): ValidationAPI {
  return {
    getGraphStateLength: async () => 999999999,
    getTextModeLength: async () => 999999999,
    validateThatGraphPassesTestSuite: async () => true,
  };
}

export async function puppeteerValidationAPI(
  basepath: string
): Promise<ValidationAPI> {
  const browser = await puppeteer.launch({ headless: true });

  return {
    getGraphStateLength: async () => 999999999,
    getTextModeLength: async () => 999999999,
    validateThatGraphPassesTestSuite: async (opts) => {
      const page = await browser.newPage();
      await page.goto(basepath + `/verify/${opts.challengeID}`);
      await page.waitForSelector(".verify-is-ready");
      const result = await page.evaluate(
        async (graphLink) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (await (window as any).verifyGraph(graphLink)).length === 0,
        opts.graphLink
      );
      debugPrint("Validation result: ", result);
      page.close();
      return result === true;
    },
  };
}
