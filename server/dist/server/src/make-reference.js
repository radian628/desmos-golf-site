import { getGraphScreenshots } from "./submit.js";
import * as fs from "node:fs/promises";
const screenshots = await getGraphScreenshots("https://www.desmos.com/calculator/aywdmfh0en");
screenshots.forEach((s, i) => {
    fs.writeFile(`reference/${i}.png`, s);
});
