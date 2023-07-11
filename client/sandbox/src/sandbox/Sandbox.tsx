import { createSignal } from "solid-js";
import { AddOrUpdateNewChallengeForm } from "../common/AddOrUpdateNewChallengeForm";
import { AdminOnly } from "../common/admin";
import TestRunnerPage from "../test-runner/TestRunnerPage";
import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import { trpc } from "../communication/trpc-setup";
import { useNavigate } from "@solidjs/router";

export function Sandbox() {
  const [challengeData, setChallengeData] =
    createSignal<ChallengeDataWithoutID>({
      name: "New Challenge",
      desc: "Put a description of the challenge here.",
      testSuite: "// write some code that generates a test suite here",
    });

  const navigate = useNavigate();

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
              navigate(`/challenge/${id}`);
            }
          }}
        ></AddOrUpdateNewChallengeForm>
      </AdminOnly>
      <h2>Desmos Test Runner</h2>
      <TestRunnerPage
        testCasesSpec={() => challengeData().testSuite}
        setTestCasesSpec={(v) =>
          setChallengeData({
            ...challengeData(),
            testSuite: v,
          })
        }
      ></TestRunnerPage>
    </>
  );
}
