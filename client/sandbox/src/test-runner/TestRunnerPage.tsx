import {
  createSignal,
  type Component,
  createEffect,
  Signal,
  Accessor,
  Show,
} from "solid-js";
import { TestRunner } from "./TestRunner";
import { DesmosChallenge } from "../../../../shared/challenge";
import { TestCasesInput } from "./TestCasesInput";
import { generateTestSuite } from "./TestSuiteGenerator";
import { StaticMath } from "./TestCaseDisplay";
import "./App.css";
import { delayChangesTo, delayedEffect } from "./DelayedEffect";
import { TestCaseMakerDocs } from "../test-runner/docs/TestCaseMakerDocs";

const SampleTestSuite1 = {
  testCases: [-10, -8, -6, -4, -2, 1, 2, 4, 6, 8, 10].map((n) => {
    return {
      referenceGraphLink: "https://www.desmos.com/calculator/nswkvhym4k",
      useTicker: false,
      input: [
        {
          type: "number",
          value: n,
        },
      ],
      expectedOutput: {
        type: "reference",
        thresholds: [0.01],
      },
    };
  }),
};

const SampleTestSuite2: DesmosChallenge = {
  testCases: [-10, -8, -6, -4, -2, 1, 2, 4, 6, 8, 10].map((n) => {
    return {
      referenceGraphLink: "https://www.desmos.com/calculator/6yampiamhp",
      useTicker: false,
      input: [
        {
          type: "number",
          value: n,
        },
      ],
      screenshot: {
        minX: -10,
        maxX: 10,
        minY: -10,
        maxY: 10,
        widthInPixels: 512,
        heightInPixels: 512,

        invalidSubmissionThreshold: 0.001,

        expectedOutput: {
          type: "reference",
        },
      },
    };
  }),
};

function asyncify<T>(value: () => Promise<T>): Accessor<T | undefined> {
  const sig = createSignal<T | undefined>(undefined);
  const [v, setV] = sig;

  createEffect(() => {
    value().then((t) => {
      setV(() => t);
    });
  });

  return v;
}

const TestRunnerPage = (props: {
  testCasesSpec: () => string;
  setTestCasesSpec: (s: string) => void;
}) => {
  const delayedTestCasesSpec = delayChangesTo(() => 1000, props.testCasesSpec);

  const testCases = asyncify(async () => {
    const testSuitePromise = generateTestSuite(delayedTestCasesSpec());
    const testSuite = await testSuitePromise;
    console.log(
      "test suite in testrunnerpage",
      delayedTestCasesSpec(),
      testSuite
    );
    return testSuite;
  });

  return (
    <>
      <TestCaseMakerDocs></TestCaseMakerDocs>
      <h2>Desmos Test Runner</h2>
      <h3>Test Suite</h3>
      <TestCasesInput
        code={props.testCasesSpec}
        setCode={props.setTestCasesSpec}
      ></TestCasesInput>
      <h3>Test Runner</h3>
      <Show when={testCases() !== undefined}>
        <TestRunner
          testSuite={testCases as Accessor<DesmosChallenge>}
        ></TestRunner>
      </Show>
    </>
  );
};

export default TestRunnerPage;
