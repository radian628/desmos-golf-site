import * as z from "zod";

type ChallengeID = number;
export const ChallengeDataParser = z.object({
  id: z.number(),
  name: z.string(),
  desc: z.string(),
  testSuite: z.string(),
});
export type ChallengeData = z.infer<typeof ChallengeDataParser>;

export const ChallengeDataWithoutIDParser = z.object({
  name: z.string(),
  desc: z.string(),
  testSuite: z.string(),
});
export type ChallengeDataWithoutID = z.infer<
  typeof ChallengeDataWithoutIDParser
>;

export const CreateNewChallengeArgsParser = z.object({
  challenge: ChallengeDataWithoutIDParser,
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
  id: number;
  creator: string;
  graphLink: string;
  graphStateScore?: number;
  textModeScore?: number;
  desc: string;
  challenge: number;
};
export type ChallengeSubmissionWithoutID = Omit<ChallengeSubmission, "id">;

export type DatabaseIOAPI = {
  getChallengeData: (cid: ChallengeID) => Promise<ChallengeData | undefined>;
  submitGraph: (info: ChallengeSubmissionWithoutID) => Promise<boolean>;
  createNewChallenge: (
    info: ChallengeDataWithoutID
  ) => Promise<number | undefined>;
  getChallengeList: () => Promise<ChallengeID[]>;
  getSubmissions: (opts: {
    challengeID: ChallengeID;
    offset: number;
    limit: number;
  }) => Promise<ChallengeSubmission[]>;
};
