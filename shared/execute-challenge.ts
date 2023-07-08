import { DesmosChallenge } from "./challenge";
import { ChallengeInterface } from "./challenge-interface";

export async function executeChallenge(
  iface: ChallengeInterface,
  challenge: DesmosChallenge
) {
  for (const test of challenge.testCases) {
    await iface.resetGraph();

    const state = await iface.getState();
  }
}
