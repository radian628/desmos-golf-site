import * as z from "zod";

export const dbParser = z.object({
  leaderboard: z.array(
    z.object({
      graphLink: z.string(),
      score: z.string(),
      submitter: z.string(),
    })
  ),
});

export type DB = z.infer<typeof dbParser>;

export const submitAPICallParser = z.object({
  type: z.literal("submit"),
  graphLink: z.string(),
  submitterUsername: z.string(),
});

export const apiCallParser = submitAPICallParser;

export type SubmitAPICall = z.infer<typeof submitAPICallParser>;

export type APICall = z.infer<typeof submitAPICallParser>;
