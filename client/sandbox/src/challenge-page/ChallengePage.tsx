import { Route, Routes, useParams } from "@solidjs/router";
import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import TestRunnerPage from "../test-runner/TestRunnerPage";
import { getChallenge, getSubmissions } from "../communication/trpc-setup";
import { For, Show, createEffect, createSignal } from "solid-js";
import { AddOrUpdateNewChallengeForm } from "../common/AddOrUpdateNewChallengeForm";
import { AdminOnly } from "../common/admin";
import { BetterRoute, Link } from "../common/better-router/BetterRoute";
import "./ChallengePage.less";

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
              fallback={<p>No submissions yet...</p>}
            >
              <For each={submissions()}>
                {(e) => <p>{JSON.stringify(e)}</p>}
              </For>
            </Show>
          </div>
        </BetterRoute>
        <BetterRoute path={() => ["submit-your-own"]}>
          <div class="submit-your-own-container">
            <h2>Submit your Own</h2>
            <div style={{ display: "flex" }}>
              <div>
                <label>Submit this Graph </label>
                <br></br>
                <input
                  value={testGraphLink()}
                  onInput={(e) => {
                    setTestGraphLink(e.target.value);
                  }}
                  placeholder="Put graph link here..."
                  style={{ width: "400px" }}
                ></input>
              </div>
              <TestRunnerPage
                testGraphLink={testGraphLink}
                setTestGraphLink={setTestGraphLink}
                testCasesSpec={() =>
                  (challengeData() as ChallengeData).testSuite
                }
                setTestCasesSpec={() => {}}
              ></TestRunnerPage>
            </div>
          </div>
        </BetterRoute>
      </Show>
    </>
  );
}
