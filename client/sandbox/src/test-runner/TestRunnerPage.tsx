import { Accessor, Show } from "solid-js";
import { TestRunner } from "./TestRunner";
import { DesmosChallenge } from "../../../../shared/challenge";
import { TestCasesInput } from "./TestCasesInput";
import { generateTestSuite } from "./TestSuiteGenerator";
import "./App.less";
import { delayChangesTo } from "./DelayedEffect";
import { TestCaseMakerDocs } from "../test-runner/docs/TestCaseMakerDocs";
import { Portal } from "solid-js/web";
import { FailedTestCaseOutput } from "../../../../shared/execute-challenge";
import { asyncify } from "../common/utils";

const TestRunnerPage = (props: {
  testCasesSpec: () => string;
  setTestCasesSpec: (s: string) => void;
  name?: () => string;
  testGraphLink: () => string;
  setTestGraphLink: (l: string) => void;
  setTestOutput: (o: FailedTestCaseOutput[]) => void;
}) => {
  const delayedTestCasesSpec = delayChangesTo(() => 1000, props.testCasesSpec);

  const testCases = asyncify(async () => {
    const testSuitePromise = generateTestSuite(delayedTestCasesSpec());
    const testSuite = await testSuitePromise;
    return testSuite;
  });

  const testRunner = TestRunner({
    testGraphLink: props.testGraphLink,
    setTestGraphLink: props.setTestGraphLink,
    testSuite: testCases as Accessor<DesmosChallenge>,
    setTestOutput: props.setTestOutput,
    setHasRunTests: () => {},
  });

  return (
    <>
      <Portal>
        <TestCaseMakerDocs></TestCaseMakerDocs>
      </Portal>
      <div style={{ display: "flex", "flex-wrap": "wrap", margin: "10px" }}>
        <div>
          <h3>Test Suite</h3>
          <TestCasesInput
            code={props.testCasesSpec}
            setCode={props.setTestCasesSpec}
          ></TestCasesInput>
        </div>
        <div>
          <h3>Test Runner</h3>
          <Show when={testCases() !== undefined}>{testRunner.element}</Show>
        </div>
      </div>
    </>
  );
};

export default TestRunnerPage;
