import { SubmitAPICall } from "../../shared/validation.js";
import puppeteer from "puppeteer";
import * as fs from "node:fs/promises";
import Jimp from "jimp";

import imageDataURI from "image-data-uri";
import { getReferenceImages } from "./get-reference-images.js";

export async function getGraphScreenshots(
  graphLink: string
): Promise<Buffer[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(graphLink);

  await page.setViewport({ width: 1000, height: 1000 });

  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      setInterval(() => {
        //@ts-ignore
        if (window.Calc) resolve();
      });
    });
  });

  const screenshots: Buffer[] = [];

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => {
      //@ts-ignore
      window.evaluatorChangesCounter = 0;
      //@ts-ignore
      const dispatcherID = Calc.controller.dispatcher.register((e) => {
        if (e.type === "on-evaluator-changes") {
          //@ts-ignore
          window.evaluatorChangesCounter++;
        }

        //@ts-ignore
        if (window.evaluatorChangesCounter === 2) {
          //@ts-ignore
          Calc.controller.dispatcher.unregister(dispatcherID);
        }
      });
      //@ts-ignore
      Calc.controller.dispatch({
        type: "action-single-step",
        //@ts-ignore
        id: Calc.controller.getItemModelByIndex(0).id,
      });
    });

    const screenshot = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          //@ts-ignore
          if (window.evaluatorChangesCounter < 2) return;
          //@ts-ignore
          Calc.asyncScreenshot(
            {
              width: 512,
              height: 512,
              mathBounds: { left: -2, right: 2, top: 2, bottom: -2 },
            },
            (screenshot: any) => {
              resolve(screenshot);
            }
          );

          clearInterval(interval);
        });
      });
    });

    screenshots.push(imageDataURI.decode(screenshot).dataBuffer as Buffer);

    fs.writeFile(`tmpdir/${i}.png`, screenshots[i]);
  }

  browser.close();

  return screenshots;
}

export async function getDiffFromReferenceImages(images: Buffer[]) {
  const referenceImages = await getReferenceImages();
  let diff = 0;
  let maxdiff = 0;
  for (let i = 0; i < referenceImages.length; i++) {
    const refimg = referenceImages[i];
    const img = images[i];
    if (!img) return Infinity;
    const [refBitmap, imgBitmap] = await Promise.all([
      Jimp.read(refimg),
      Jimp.read(img),
    ]);

    const refData = refBitmap.bitmap.data;
    const imgData = imgBitmap.bitmap.data;

    if (refData.length !== imgData.length) return Infinity;

    for (let j = 0; j < refData.length; j++) {
      const localdiff = Math.abs(refData[j] - imgData[j]);
      diff += localdiff;
      if (localdiff > 0) {
        console.log(
          "bigdiff",
          Math.floor(j / 4) % 512,
          Math.floor(j / 4 / 512),
          diff,
          refData[j],
          imgData[j],
          i
        );
      }
      maxdiff += 256;
    }
  }

  return diff / maxdiff;
}

export async function submitGraph(apiCall: SubmitAPICall) {
  const screenshots = await getGraphScreenshots(apiCall.graphLink);
  const diff = await getDiffFromReferenceImages(screenshots);
  console.log("diff", diff);
}
