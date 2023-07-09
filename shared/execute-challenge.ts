import { DesmosChallenge, DesmosData, TestCase } from "./challenge";
import { ChallengeInterface, ChallengeInterfaces } from "./challenge-interface";

const stuffAfterEqRegex = /=[^]*$/g;

type RawDesmosData = number | number[] | RawDesmosData[];

function desmosDataEq(a: RawDesmosData, b: RawDesmosData, threshold: number) {
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (!desmosDataEq(a[i], b[i], threshold)) return false;
    }
    return true;
  }

  if (typeof a === "number" && typeof b === "number")
    return Math.abs(a - b) <= threshold;

  return false;
}

export function serializeDesmosData(data: DesmosData): string {
  switch (data.type) {
    case "number":
      return data.value.toString();
    case "color":
      return `\\operatorname{rgb}\\left(${data.value[0]},${data.value[1]},${data.value[2]}\\right)`;
    case "point":
      return `\\left(${data.value[0]}, ${data.value[1]}\\right)`;
    case "polygon":
      return `\\operatorname{polygon}\\left(${data.value
        .map((e) => `\\left(${e[0]}, ${e[1]}\\right)`)
        .join(",")}\\right)`;
    case "number-list":
      return `\\left[${data.value.join(",")}\\right]`;
    case "point-list":
      return `\\left[${data.value.map(
        (e) => `\\left(${e[0]},${e[1]}\\right)`
      )}\\right]`;
    case "color-list":
      return `\\left[${data.value.map(
        (e) => `\\operatorname{rgb}\\left(${e[0]},${e[1]},${e[2]}\\right)`
      )}\\right]`;
    case "polygon-list":
      return `\\left[${data.value
        .map((v) =>
          serializeDesmosData({
            type: "polygon",
            value: v,
          })
        )
        .join(",")}\\right]`;
  }
}

export type FailedTestCaseOutput = {
  inputs: {
    name: string;
    value: DesmosData;
  }[];
  screenshot?: {
    test: number[]; //todo maybe change idk
    reference: number[]; //todo maybe change idk
    diff: number;
    width: number;
  };
  outputs?: {
    name: string;
    test: DesmosData;
    reference: DesmosData;
  }[];
};

type TestCaseOutput = {
  inputs: {
    name: string;
    value: DesmosData;
  }[];
  outputExpressions?: {
    name: string;
    value: DesmosData;
  }[];
  outputScreenshot?: number[];
};

export async function runTestCase(
  iface: ChallengeInterface,
  test: TestCase
): Promise<TestCaseOutput> {
  const tco: TestCaseOutput = { inputs: [] };

  await iface.resetGraph();

  const state = await iface.getState();
  let inputIndex = 0;

  // set inputs
  for (const item of state.expressions.list) {
    if (inputIndex >= test.input.length) break;

    if (item.type !== "expression") continue;
    if (!item.latex) continue;
    let stuffAfterEq = item.latex.match(stuffAfterEqRegex);
    if (!stuffAfterEq) continue;

    console.log(test, inputIndex);

    tco.inputs.push({
      name: item.latex.replace(stuffAfterEqRegex, ""),
      value: test.input[inputIndex],
    });

    let newLatex =
      item.latex.replace(stuffAfterEqRegex, "") +
      "=" +
      serializeDesmosData(test.input[inputIndex]);

    await iface.setExpressionLatex(item.id, newLatex);

    inputIndex++;
  }

  // run ticker if applicable
  if (test.useTicker) {
    while (await iface.doTickerStep());
  }

  if (test.expectedOutput) {
    tco.outputExpressions = [];

    const outputCount =
      test.expectedOutput.type === "data"
        ? test.expectedOutput.data.length
        : test.expectedOutput.thresholds.length;

    const outState = await iface.getState();
    state.expressions.list.reverse();
    let outputIndex = 0;
    for (const item of state.expressions.list) {
      if (outputIndex >= outputCount) break;

      if (item.type !== "expression") continue;
      if (!item.latex) continue;

      const expressionValue = await iface.getExpressionValue(item.id);
      if (!expressionValue) continue;

      tco.outputExpressions.push({
        value: expressionValue,
        name: item.latex.replace(stuffAfterEqRegex, ""),
      });
      outputIndex++;
    }
  }

  if (test.screenshot) {
    tco.outputScreenshot = await iface.getScreenshotBitmap({
      xmin: test.screenshot.minX,
      xmax: test.screenshot.maxX,
      ymin: test.screenshot.minY,
      ymax: test.screenshot.maxY,
      widthInPixels: test.screenshot.widthInPixels,
      heightInPixels: test.screenshot.heightInPixels,
    });
  }

  return tco;
}

export async function executeTestCase(
  ifaces: ChallengeInterfaces,
  test: TestCase
): Promise<
  { success: true } | { success: false; output?: FailedTestCaseOutput }
> {
  // create and run a test case for the reference graph, if applicable
  const testCaseForReference: TestCase = {
    input: test.input,
    useTicker: test.useTicker,
  };
  if (test.expectedOutput?.type === "reference")
    testCaseForReference.expectedOutput = test.expectedOutput;
  if (test.screenshot?.expectedOutput.type === "reference")
    testCaseForReference.screenshot = test.screenshot;
  let referenceTestCaseOutput: TestCaseOutput | undefined;
  if (testCaseForReference.expectedOutput || testCaseForReference.screenshot) {
    const referenceGraphInterface = await ifaces.referenceGraphs(
      test.referenceGraphLink
    );
    if (!referenceGraphInterface) {
      console.warn("Test uses references without a reference graph!");
      return { success: false };
    }
    referenceTestCaseOutput = await runTestCase(
      referenceGraphInterface,
      testCaseForReference
    );
  }

  // expected expression output, whether there's a reference or not
  let expectedOutput:
    | {
        type: "data";
        data: {
          expectedValue: DesmosData;
          threshold: number;
        }[];
      }
    | undefined;

  // populate expected expression output
  const testExpectedOutput = test.expectedOutput;
  if (
    referenceTestCaseOutput?.outputExpressions &&
    testExpectedOutput?.type === "reference"
  ) {
    expectedOutput = {
      type: "data",
      data: referenceTestCaseOutput.outputExpressions.map((rtco, i) => {
        return {
          expectedValue: rtco.value,
          threshold: testExpectedOutput.thresholds[i] ?? -1,
        };
      }),
    };
  } else {
    expectedOutput = test.expectedOutput as typeof expectedOutput;
  }

  // expected screenshot output
  let expectedScreenshot: number[] | undefined;
  if (referenceTestCaseOutput?.outputScreenshot) {
    expectedScreenshot = referenceTestCaseOutput.outputScreenshot;
  } else if (test.screenshot?.expectedOutput.type === "uri") {
    expectedScreenshot = await ifaces.testGraph.uriToBitmap(
      test.screenshot.expectedOutput.value
    );
  }

  const testCaseOutput = await runTestCase(ifaces.testGraph, test);

  const outputIfFailure: FailedTestCaseOutput = {
    inputs: testCaseOutput.inputs,
  };

  // ensure that output screenshot is as expected
  if (testCaseOutput.outputScreenshot && expectedScreenshot) {
    if (testCaseOutput.outputScreenshot.length != expectedScreenshot.length)
      return { success: false };
    let diff = 0;
    for (let i = 0; i < expectedScreenshot.length; i++) {
      diff += Math.abs(
        testCaseOutput.outputScreenshot[i] - expectedScreenshot[i]
      );
    }

    const normalizedDiff = diff / (expectedScreenshot.length * 256);

    outputIfFailure.screenshot = {
      reference: expectedScreenshot,
      test: testCaseOutput.outputScreenshot,
      diff: normalizedDiff,
      width: test.screenshot?.widthInPixels as number,
    };

    if (normalizedDiff > (test.screenshot?.invalidSubmissionThreshold ?? -1))
      return { success: false, output: outputIfFailure };
  }

  // ensure that output expressions are as expected
  if (testCaseOutput.outputExpressions && expectedOutput) {
    outputIfFailure.outputs = [];

    if (testCaseOutput.outputExpressions.length != expectedOutput.data.length) {
      return { success: false };
    } else {
      let failure = false;
      for (let i = 0; i < expectedOutput.data.length; i++) {
        outputIfFailure.outputs.push({
          name: testCaseOutput.outputExpressions[i].name,
          test: testCaseOutput.outputExpressions[i].value,
          reference: expectedOutput.data[i].expectedValue,
        });

        if (
          !desmosDataEq(
            testCaseOutput.outputExpressions[i].value.value,
            expectedOutput.data[i].expectedValue.value,
            expectedOutput.data[i].threshold
          )
        )
          failure = true;
      }
      if (failure) return { success: false, output: outputIfFailure };
    }
  }

  return { success: true };
}

export async function executeChallenge(
  ifaces: ChallengeInterfaces,
  challenge: DesmosChallenge
) {
  let testIndex = 0;
  let testsFailed: FailedTestCaseOutput[] = [];
  for (const test of challenge.testCases) {
    const passed = await executeTestCase(ifaces, test);
    console.log("TEST", passed);

    if (!passed.success && passed.output) {
      testsFailed.push(passed.output);
    }

    testIndex++;
  }

  return testsFailed;
}
