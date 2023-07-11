import { useParams } from "@solidjs/router";
import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import TestRunnerPage from "../test-runner/TestRunnerPage";
import { getChallenge } from "../communication/trpc-setup";
import { Show, createEffect, createSignal } from "solid-js";
import { AddOrUpdateNewChallengeForm } from "../common/AddOrUpdateNewChallengeForm";
import { AdminOnly } from "../common/admin";
import { makeObjPropSetter } from "../common/utils";

export default function ChallengePage() {
  const { challengeID } = useParams();

  const challengeData = getChallenge(() => Number(challengeID));

  const [challengeDataCopy, setChallengeDataCopy] =
    createSignal<ChallengeDataWithoutID>();

  createEffect(() => {
    if (!challengeData()) return;
    setChallengeDataCopy(challengeData());
  });

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
        <TestRunnerPage
          testCasesSpec={() => (challengeData() as ChallengeData).testSuite}
          setTestCasesSpec={() => {}}
        ></TestRunnerPage>
      </Show>
    </>
  );
}
