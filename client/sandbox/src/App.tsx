import { createSignal, type Component } from "solid-js";
import { TestRunner } from "./TestRunner";
import { DesmosChallenge } from "../../../shared/challenge";

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

const App: Component = () => {
  const [testSuite, setTestSuite] = createSignal(
    JSON.stringify(SampleTestSuite2)
  );

  return (
    <>
      <h1>Desmos Test Runner</h1>
      <h2>Test Suite</h2>
      <textarea
        onChange={(e) => {
          setTestSuite(e.target.value);
        }}
      >
        {testSuite()}
      </textarea>
      <h2>Test Runner</h2>
      <TestRunner testSuite={() => JSON.parse(testSuite())}></TestRunner>
    </>
  );
};

export default App;
