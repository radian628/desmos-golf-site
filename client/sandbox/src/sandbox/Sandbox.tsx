import { Accessor, Show, createSignal } from "solid-js";
import { AddOrUpdateNewChallengeForm } from "../common/AddOrUpdateNewChallengeForm";
import { AdminOnly } from "../common/admin";
import TestRunnerPage from "../test-runner/TestRunnerPage";
import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import { trpc } from "../communication/trpc-setup";
import { FailedTestCaseOutput } from "../../../../shared/execute-challenge";
import { TestRunner } from "../test-runner/TestRunner";
import { DesmosChallenge } from "../../../../shared/challenge";
import { Horizontal, asyncify } from "../common/utils";
import { generateTestSuite } from "../test-runner/TestSuiteGenerator";
import { TestRunnerOutput } from "../test-runner/output/TestRunnerOutput";

export function Sandbox() {
  const [challengeData, setChallengeData] =
    createSignal<ChallengeDataWithoutID>({
      name: "New Challenge",
      desc: "Put a description of the challenge here.",
      testSuite:
        localStorage.getItem("golfsite-sandbox-graph-link") ??
        "// write some code that generates a test suite here",
    });

  const [testGraphLink, setTestGraphLink] = createSignal<string>("");

  const testCases = asyncify(async () => {
    const testCasesSpec = challengeData()?.testSuite;
    if (!testCasesSpec) return;
    const testSuitePromise = generateTestSuite(testCasesSpec);
    const testSuite = await testSuitePromise;
    return testSuite;
  });

  const [testOutput, setTestOutput] = createSignal<FailedTestCaseOutput[]>([]);
  const [hasRunTests, setHasRunTests] = createSignal(false);

  const testRunner = TestRunner({
    testGraphLink: testGraphLink,
    setTestGraphLink: setTestGraphLink,
    testSuite: testCases as Accessor<DesmosChallenge>,
    setTestOutput: setTestOutput,
    setHasRunTests: setHasRunTests,
  });

  return (
    <>
      <h1>Sandbox</h1>
      <AdminOnly>
        <AddOrUpdateNewChallengeForm
          name={() => "Upload Challenge"}
          get={() => challengeData() as ChallengeData}
          set={(d: ChallengeData) => {
            setChallengeData(d);
          }}
          submit={async (secret) => {
            const id = await trpc.createNewChallenge.mutate({
              challenge: challengeData(),
              secret,
            });

            if (id !== undefined) {
              history.pushState(undefined, "", `/challenge/${id}/submissions`);
            }
          }}
        ></AddOrUpdateNewChallengeForm>
      </AdminOnly>
      <h2>Desmos Test Runner</h2>
      <Horizontal>
        <label>Test this Graph </label>
        <input
          value={testGraphLink()}
          onInput={(e) => {
            setTestGraphLink(e.target.value);
          }}
          placeholder="Put graph link here..."
          style={{ width: "400px" }}
        ></input>
        <button
          onClick={async (e) => {
            setHasRunTests(false);
            e.target.innerHTML = "Running test suite...";
            await testRunner.runTestSuite();
            e.target.innerHTML = "Submit";
          }}
        >
          Run
        </button>
      </Horizontal>
      <Horizontal>
        <TestRunnerPage
          testGraphLink={testGraphLink}
          setTestGraphLink={setTestGraphLink}
          testCasesSpec={() => challengeData().testSuite}
          setTestCasesSpec={(v) => {
            localStorage.setItem("golfsite-sandbox-graph-link", v);
            setChallengeData({
              ...challengeData(),
              testSuite: v,
            });
          }}
          setTestOutput={(output) => {
            setTestOutput(output);
            setHasRunTests(true);
          }}
        ></TestRunnerPage>
        <Show when={hasRunTests()}>
          <TestRunnerOutput
            testCount={() => testCases()?.testCases.length ?? 0}
            testsFailed={testOutput}
          ></TestRunnerOutput>
        </Show>
      </Horizontal>
    </>
  );
}
