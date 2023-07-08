import puppeteer from "puppeteer";
import Jimp from "jimp";
import imageDataURI from "image-data-uri";
import { getReferenceImages } from "./get-reference-images.js";
export async function getGraphScreenshots(graphLink) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(graphLink);
    await page.setViewport({ width: 1000, height: 1000 });
    await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            setInterval(() => {
                //@ts-ignore
                if (window.Calc)
                    resolve();
            });
        });
    });
    const screenshots = [];
    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => {
            //@ts-ignore
            Calc.controller.dispatch({
                type: "action-single-step",
                //@ts-ignore
                id: Calc.controller.getItemModelByIndex(0).id,
            });
        });
        const screenshot = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                //@ts-ignore
                Calc.asyncScreenshot({
                    width: 512,
                    height: 512,
                    mathBounds: { left: -2, right: 2, top: 2, bottom: -2 },
                }, (screenshot) => {
                    resolve(screenshot);
                });
            });
        });
        screenshots.push(imageDataURI.decode(screenshot).dataBuffer);
    }
    browser.close();
    return screenshots;
}
export async function getDiffFromReferenceImages(images) {
    const referenceImages = await getReferenceImages();
    let diff = 0;
    let maxdiff = 0;
    for (let i = 0; i < referenceImages.length; i++) {
        const refimg = referenceImages[i];
        const img = images[i];
        if (!img)
            return Infinity;
        const [refBitmap, imgBitmap] = await Promise.all([
            Jimp.read(refimg),
            Jimp.read(img),
        ]);
        const refData = refBitmap.bitmap.data;
        const imgData = imgBitmap.bitmap.data;
        if (refData.length !== imgData.length)
            return Infinity;
        for (let i = 0; i < refData.length; i++) {
            diff += Math.abs(refData[i] - imgData[i]);
            maxdiff += 256;
        }
    }
    return diff / maxdiff;
}
export async function submitGraph(apiCall) {
    const screenshots = await getGraphScreenshots(apiCall.graphLink);
    const diff = await getDiffFromReferenceImages(screenshots);
    console.log("diff", diff);
}
