import {
  createSignal,
  type Component,
  createEffect,
  Signal,
  Accessor,
  Show,
} from "solid-js";
import { TestRunner } from "./TestRunner";
import { DesmosChallenge } from "../../../shared/challenge";
import { TestCasesInput } from "./TestCasesInput";
import { generateTestSuite } from "./TestSuiteGenerator";
import { StaticMath } from "./TestCaseDisplay";
import "./App.css";

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
      console.log("testsuite", t);
    });
  });

  return v;
}

const App: Component = () => {
  const [testCasesSpec, setTestCasesSpec] = createSignal(`test({
    reference: "https://www.desmos.com/calculator/6yampiamhp",
    inputTypes: ["number"] as const,
    inputs: [-10, -8, -6, -4, -2, 1, 2, 4, 6, 8, 10].map(e => [e]),
    screenshot: {}
  });`);

  const testCases = asyncify(async () => {
    const testSuitePromise = generateTestSuite(testCasesSpec());
    console.log("test suite promise", testSuitePromise);
    const testSuite = await testSuitePromise;
    console.log(
      "got here test suite!1!!",
      testSuitePromise,
      testSuite,
      testCasesSpec()
    );
    return testSuite;
  });

  return (
    <>
      <h1>Desmos Test Runner</h1>
      <h2>Test Suite</h2>
      <TestCasesInput
        code={testCasesSpec}
        setCode={setTestCasesSpec}
      ></TestCasesInput>
      <h2>Test Runner</h2>
      <Show when={testCases() !== undefined}>
        <TestRunner
          testSuite={testCases as Accessor<DesmosChallenge>}
        ></TestRunner>
      </Show>
    </>
  );
};

export default App;
