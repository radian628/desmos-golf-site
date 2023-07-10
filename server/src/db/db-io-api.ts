import * as z from "zod";

type ChallengeID = number;
type TestSuite = string;
export const ChallengeDataParser = z.object({
  name: z.string(),
  desc: z.string(),
  testSuite: z.string(),
});
export type ChallengeData = z.infer<typeof ChallengeDataParser>;

export const CreateNewChallengeArgsParser = z.object({
  challenge: ChallengeDataParser,
  secret: z.string(),
});
export type CreateNewChallengeArgs = z.infer<
  typeof CreateNewChallengeArgsParser
>;

export const SubmitGraphArgsParser = z.object({
  graphLink: z.string(),
  challenge: z.number(),
  creator: z.string(),
  desc: z.string(),
});
export type SubmitGraphArgs = z.infer<typeof SubmitGraphArgsParser>;

export type ChallengeSubmission = {
  creator: string;
  graphLink: string;
  graphStateScore?: number;
  textModeScore?: number;
  desc: string;
  challenge: number;
};

export type DatabaseIOAPI = {
  getChallengeData: (cid: ChallengeID) => Promise<ChallengeData | undefined>;
  submitGraph: (info: ChallengeSubmission) => Promise<boolean>;
  createNewChallenge: (info: ChallengeData) => Promise<boolean>;
  getChallengeList: () => Promise<ChallengeID[]>;
  getSubmissions: (cid: ChallengeID) => Promise<ChallengeSubmission[]>;
};
