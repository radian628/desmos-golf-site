import * as fs from "node:fs/promises";
export function getReferenceImages() {
    return Promise.all(new Array(8).fill(0).map((e, i) => {
        return fs.readFile(`reference/${i}.png`);
    }));
}
