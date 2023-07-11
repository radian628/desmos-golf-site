import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createClientServerAPI } from "../../../../server/src/api/client-server-api";
import {
  ChallengeData,
  ChallengeDataWithoutID,
} from "../../../../server/src/db/db-io-api";
import { createEffect, createSignal } from "solid-js";

export function getChallenge(id: () => number) {
  const [challengeData, setChallengeData] =
    createSignal<ChallengeDataWithoutID>();

  createEffect(async () => {
    const cd = await trpc.challengeData.query(id());
    if (!cd) {
      setChallengeData({
        name: "Deleted Challenge",
        desc: "This challenge does not exist.",
        testSuite: "",
      });
      return;
    }
    setChallengeData(cd);
  });

  return challengeData;
}

export function getChallenges() {
  const [numberOfChallengesToLoad, setNumberOfChallengesToLoad] =
    createSignal(0);

  const [challengeList, setChallengeList] = createSignal<
    Map<number, ChallengeData>
  >(new Map());

  const [challengeIDList, setChallengeIDList] = createSignal<number[]>([]);

  createEffect(async () => {
    setChallengeIDList(await trpc.challengeList.query());
  });

  const loadN = async (n: number) => {
    const oldNumberOfChallengesToLoad = numberOfChallengesToLoad();
    setNumberOfChallengesToLoad(numberOfChallengesToLoad() + n);
    const challengeIDsToLoad = challengeIDList()?.slice(
      oldNumberOfChallengesToLoad,
      numberOfChallengesToLoad()
    );

    const newlyLoadedChallenges: [number, ChallengeData][] = await Promise.all(
      challengeIDsToLoad?.map(async (idx) => {
        const c = (await trpc.challengeData.query(idx)) ?? {
          name: "Deleted Challenge",
          desc: "This challenge no longer exists.",
          testSuite: "",
          id: -1,
        };
        return [idx, c];
      }) ?? []
    );

    const updatedChallengeList = new Map<number, ChallengeData>([
      ...(challengeList()?.entries() ?? []),
      ...newlyLoadedChallenges,
    ]);

    setChallengeList(updatedChallengeList);
  };

  const reload = async () => {
    setNumberOfChallengesToLoad(0);
  };

  return {
    challengeList,
    challengeIDList,
    loadN,
    reload,
  };
}

export const trpc = createTRPCProxyClient<
  ReturnType<typeof createClientServerAPI>
>({
  links: [
    httpBatchLink({
      url: "/api",
    }),
  ],
});

// @ts-expect-error
window.trpc = trpc;
