import { For } from "solid-js";
import { FailedTestCaseOutput } from "../../../../../shared/execute-challenge";
import { FailedTestCaseDisplay } from "./TestCaseDisplay";

export function TestRunnerOutput(props: {
  testsFailed: () => FailedTestCaseOutput[];
  testCount: () => number;
}) {
  return (
    <div>
      {props.testsFailed().length > 0 ? (
        <>
          <h2>
            {props.testsFailed().length} out of {props.testCount()} Tests
            Failed:
          </h2>
          <For each={props.testsFailed()}>
            {(f) => (
              <FailedTestCaseDisplay case={() => f}></FailedTestCaseDisplay>
            )}
          </For>
        </>
      ) : (
        <>
          <h2>All Tests Have Passed</h2>
        </>
      )}
    </div>
  );
}
