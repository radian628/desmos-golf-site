import { DesmosChallenge, TestCase } from "../../../shared/challenge";
import Evalbox from "./evalbox.html?raw";
import * as ts from "typescript";

type Message =
  | {
      type: "error";
      why: string;
    }
  | {
      type: "test";
      args: Parameters<typeof test>;
    };

const generateTestCases: <T extends readonly InputType[]>(
  ...args: Parameters<typeof test<T>>
) => TestCase[] = (settings) => {
  const cases: TestCase[] = [];
  for (const input of settings.inputs) {
    cases.push({
      input: input.map((e, i) => ({ value: e, type: settings.inputTypes[i] })),
      useTicker: settings.ticker ?? false,
      referenceGraphLink: settings.reference,
      expectedOutput: settings.outputs
        ? {
            type: "reference",
            thresholds: settings.outputs?.map((o) => o.threshold),
          }
        : undefined,
      screenshot: settings.screenshot
        ? {
            minX: settings.screenshot?.rangeX?.[0] ?? -10,
            minY: settings.screenshot?.rangeY?.[0] ?? -10,
            maxX: settings.screenshot?.rangeX?.[1] ?? 10,
            maxY: settings.screenshot?.rangeY?.[1] ?? 10,
            widthInPixels: settings.screenshot?.resolution?.[0] ?? 512,
            heightInPixels: settings.screenshot?.resolution?.[1] ?? 512,
            invalidSubmissionThreshold: settings.screenshot?.threshold ?? 0.001,
            expectedOutput: { type: "reference" },
          }
        : undefined,
    });
  }
  return cases;
};

const iframe = document.createElement("iframe");
iframe.setAttribute("sandbox", "allow-scripts");
iframe.setAttribute("origin", window.location.origin);
iframe.srcdoc = Evalbox;
iframe.style.display = "none";
document.body.appendChild(iframe);

export function generateTestSuite(
  src: string
): Promise<DesmosChallenge | undefined> {
  return new Promise<DesmosChallenge | undefined>((resolve, reject) => {
    const code = src.toString();
    const transpiledCode = ts.transpileModule(code, {}).outputText;
    const messageHandler = (msg: MessageEvent) => {
      console.log("got msg!!", msg, src);
      window.removeEventListener("message", messageHandler);
      const data = msg.data as Message[];
      const challenge: DesmosChallenge = { testCases: [] };
      for (const msg of data) {
        switch (msg.type) {
          case "error":
            resolve(undefined);
            return;
          case "test":
            challenge.testCases.push(...generateTestCases(...msg.args));
        }
      }
      console.log("work you idiot", challenge);
      resolve(challenge);
    };
    window.addEventListener("message", messageHandler);
    iframe.contentWindow?.postMessage({ code: transpiledCode }, "*");
  });
}
