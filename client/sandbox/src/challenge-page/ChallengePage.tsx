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

export default function ChallengePage() {
  const { challengeID } = useParams();

  const challengeData = getChallenge(() => Number(challengeID));

  const [challengeDataCopy, setChallengeDataCopy] =
    createSignal<ChallengeDataWithoutID>();

  createEffect(() => {
    if (!challengeData()) return;
    setChallengeDataCopy(challengeData());
  });

  const [submissions, reloadSubmissions] = getSubmissions(() =>
    Number(challengeID)
  );

  return (
    <>
      <Show when={challengeData()}>
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
        <Route path="/challenge/:id">
          <Route
            path="/submissions"
            component={() => (
              <div class="submissions-container">
                <h2>Submissions</h2>
                <For each={submissions()}>
                  {(e) => <p>{JSON.stringify(e)}</p>}
                </For>
              </div>
            )}
          ></Route>
          <Route
            path="/submit-your-own"
            component={() => (
              <div class="submit-your-own-container">
                <h2>Submit your Own</h2>
                <TestRunnerPage
                  testCasesSpec={() =>
                    (challengeData() as ChallengeData).testSuite
                  }
                  setTestCasesSpec={() => {}}
                ></TestRunnerPage>
              </div>
            )}
          ></Route>
        </Route>
      </Show>
    </>
  );
}
