import * as z from "zod";
export const ChallengeDataParser = z.object({
    name: z.string(),
    desc: z.string(),
    testSuite: z.string(),
});
export const CreateNewChallengeArgsParser = z.object({
    challenge: ChallengeDataParser,
    secret: z.string(),
});
export const SubmitGraphArgsParser = z.object({
    graphLink: z.string(),
    challenge: z.number(),
    creator: z.string(),
    desc: z.string(),
});
