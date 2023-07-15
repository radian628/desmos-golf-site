import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import { getChallenge, getSubmissions } from "../communication/trpc-setup";
import { Accessor, For, Show, createEffect, createSignal } from "solid-js";
import { AddOrUpdateNewChallengeForm } from "../common/AddOrUpdateNewChallengeForm";
import { AdminOnly } from "../common/admin";
import { BetterRoute, Link } from "../common/better-router/BetterRoute";
import "./ChallengePage.less";
import { Horizontal, asyncify } from "../common/utils";
import { FailedTestCaseOutput } from "../../../../shared/execute-challenge";
import { TestRunnerOutput } from "../test-runner/output/TestRunnerOutput";
import { TestCasesInput } from "../test-runner/TestCasesInput";
import { TestRunner } from "../test-runner/TestRunner";
import { generateTestSuite } from "../test-runner/TestSuiteGenerator";
import { DesmosChallenge } from "../../../../shared/challenge";
import { ChallengeSubmitForm } from "./ChallengeSubmitForm";
import { SubmissionDisplay } from "./SubmissionDisplay";

export default function ChallengePage(props: { challengeID: () => string }) {
  const challengeData = getChallenge(() => Number(props.challengeID()));

  const [challengeDataCopy, setChallengeDataCopy] =
    createSignal<ChallengeDataWithoutID>();

  createEffect(() => {
    if (!challengeData()) return;
    setChallengeDataCopy(challengeData());
  });

  const [submissions, reloadSubmissions] = getSubmissions(() =>
    Number(props.challengeID())
  );

  const [testGraphLink, setTestGraphLink] = createSignal<string>("");

  const [testOutput, setTestOutput] = createSignal<FailedTestCaseOutput[]>([]);
  const [hasRunTests, setHasRunTests] = createSignal(false);

  const testCases = asyncify(async () => {
    const testCasesSpec = challengeData()?.testSuite;
    if (!testCasesSpec) return;
    const testSuitePromise = generateTestSuite(testCasesSpec);
    const testSuite = await testSuitePromise;
    return testSuite;
  });

  const testRunner = TestRunner({
    testGraphLink: testGraphLink,
    setTestGraphLink: setTestGraphLink,
    testSuite: testCases as Accessor<DesmosChallenge>,
    setTestOutput: setTestOutput,
    setHasRunTests: setHasRunTests,
  });

  return (
    <>
      <Show when={challengeData()} fallback={<p>Loading...</p>}>
        <AdminOnly>
          <Show when={challengeDataCopy()}>
            <AddOrUpdateNewChallengeForm
              name={() => "Update Challenge"}
              get={() => challengeDataCopy() as ChallengeData}
              set={(d: ChallengeData) => {
                setChallengeDataCopy(d);
              }}
              submit={() => {
                window.location.reload();
              }}
            ></AddOrUpdateNewChallengeForm>
          </Show>
        </AdminOnly>
        <h1>Challenge: {challengeData()?.name ?? "Loading..."}</h1>
        <p>{challengeData()?.desc ?? "Loading..."}</p>
        <nav class="challenge-page-nav">
          <Link isButton to={() => "submissions"}>
            Submissions
          </Link>
          <Link isButton to={() => "submit-your-own"}>
            Submit your Own
          </Link>
        </nav>
        <BetterRoute path={() => ["submissions"]}>
          <div class="submissions-container">
            <h2>Submissions</h2>
            <Show
              when={submissions().length > 0}
              fallback={<p>No submissions yet</p>}
            >
              <For each={submissions()}>
                {(e) => (
                  <SubmissionDisplay submission={() => e}></SubmissionDisplay>
                )}
              </For>
            </Show>
          </div>
        </BetterRoute>
        <BetterRoute path={() => ["submit-your-own"]}>
          <div class="submit-your-own-container">
            <Horizontal>
              <h2>Submit your Own</h2>
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
                Submit
              </button>
              <Show when={hasRunTests()}>
                <span
                  style={{
                    color:
                      testOutput().length > 0
                        ? "var(--failure-color)"
                        : "var(--success-color)",
                    "align-self": "center",
                  }}
                >
                  {testOutput().length > 0
                    ? "Submission failed due to failing tests"
                    : "Success!"}
                </span>
              </Show>
            </Horizontal>
            <Horizontal>
              <div>
                <h3>Test Suite</h3>
                <TestCasesInput
                  code={() => challengeData()?.testSuite ?? ""}
                  setCode={() => {}}
                  readonly
                ></TestCasesInput>
              </div>
              <div>
                <h3>Test Runner</h3>
                <Show when={testCases() !== undefined}>
                  {testRunner.element}
                </Show>
              </div>
              <Show when={hasRunTests()}>
                <TestRunnerOutput
                  testCount={() => testCases()?.testCases.length ?? 0}
                  testsFailed={testOutput}
                ></TestRunnerOutput>
              </Show>
            </Horizontal>
          </div>
          <Show when={hasRunTests() && testOutput().length === 0}>
            <ChallengeSubmitForm
              challengeID={() => Number(props.challengeID())}
              graphLink={testGraphLink}
              close={() => {
                setHasRunTests(false);
              }}
            ></ChallengeSubmitForm>
          </Show>
        </BetterRoute>
      </Show>
    </>
  );
}
function delayedTestCasesSpec(): any {
  throw new Error("Function not implemented.");
}
