import puppeteer from "puppeteer";
export function dummyValidationAPI() {
    return {
        getGraphStateLength: async () => 999999999,
        getTextModeLength: async () => 999999999,
        validateThatGraphPassesTestSuite: async () => true,
    };
}
export async function puppeteerValidationAPI(basepath) {
    const browser = await puppeteer.launch({ headless: true });
    return {
        getGraphStateLength: async () => 999999999,
        getTextModeLength: async () => 999999999,
        validateThatGraphPassesTestSuite: async (opts) => {
            const page = await browser.newPage();
            await page.goto(basepath + `/verify/${opts.challengeID}`);
            await page.waitForSelector(".verify-is-ready");
            const result = await page.evaluate(async (graphLink) => (await window.verifyGraph(graphLink)).length === 0, opts.graphLink);
            console.log("Validation result: ", result);
            return result === true;
        },
    };
}
