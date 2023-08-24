import { DesmosChallenge, TestCase } from "../../../../shared/challenge";
import { getTypescript } from "./TestCasesInput";
import Evalbox from "./evalbox.html?raw";

type Message =
  | {
      type: "error";
      why: string;
    }
  | {
      type: "test";
      args: Parameters<typeof test>;
    }
  | {
      type: "directTest";
      args: Parameters<typeof directTest>;
    };

const generateTestCases: <T extends readonly DataType[]>(
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

const generateDirectTestCases: <
  I extends readonly DataType[],
  O extends readonly DataType[],
>(
  ...args: Parameters<typeof directTest<I, O>>
) => TestCase[] = (settings) => {
  const cases: TestCase[] = [];
  for (const c of settings.testCases) {
    cases.push({
      input: c.in.map((e, i) => ({ value: e, type: settings.inputTypes[i] })),
      useTicker: settings.ticker ?? false,
      expectedOutput: {
        type: "data",
        data: c.out.map((e, i) => ({
          expectedValue: {
            // @ts-expect-error type inference being dumb here
            value: e.data,
            type: settings.outputTypes[i],
          },
          // @ts-expect-error type inference being dumb here
          threshold: e.threshold ?? 0,
        })),
      },
    });
  }
  return cases;
};

let iframe: HTMLIFrameElement;

function forceLoadIframe() {
  if (iframe) return;
  iframe = document.createElement("iframe");
  const promise = new Promise<void>((resolve) => {
    const handler = () => {
      iframe.removeEventListener("load", handler);
      resolve();
    };
    iframe.addEventListener("load", handler);
  });
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("origin", window.location.origin);
  iframe.srcdoc = Evalbox;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // keep on polling the iframe until it responds so we know it's ready
  return promise;
}

export async function generateTestSuite(
  src: string
): Promise<DesmosChallenge | undefined> {
  await forceLoadIframe();

  // eslint-disable-next-line no-async-promise-executor
  return await new Promise<DesmosChallenge | undefined>(async (resolve) => {
    const code = src.toString();
    const transpiledCode = (await getTypescript()).transpileModule(
      code,
      {}
    ).outputText;
    const messageHandler = (msg: MessageEvent) => {
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
            break;
          case "directTest":
            challenge.testCases.push(...generateDirectTestCases(...msg.args));
        }
      }
      resolve(challenge);
    };
    window.addEventListener("message", messageHandler);
    iframe.contentWindow?.postMessage({ code: transpiledCode }, "*");
  });
}
