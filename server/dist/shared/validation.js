import * as z from "zod";
export const dbParser = z.object({
    leaderboard: z.array(z.object({
        graphLink: z.string(),
        score: z.string(),
        submitter: z.string(),
    })),
});
export const submitAPICallParser = z.object({
    type: z.literal("submit"),
    graphLink: z.string(),
    submitterUsername: z.string(),
});
export const apiCallParser = submitAPICallParser;
