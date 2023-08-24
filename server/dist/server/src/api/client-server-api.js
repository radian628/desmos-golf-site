import { initTRPC } from "@trpc/server";
import { CreateNewChallengeArgsParser, SubmitGraphArgsParser, } from "../db/db-io-api.js";
import * as z from "zod";
export var SubmitGraphState;
(function (SubmitGraphState) {
    SubmitGraphState["Succeeded"] = "succeeded";
    SubmitGraphState["Failed"] = "failed";
    SubmitGraphState["Error"] = "error";
})(SubmitGraphState || (SubmitGraphState = {}));
export function createClientServerAPI(databaseIOAPI, validationAPI, secret) {
    const t = initTRPC.create();
    const appRouter = t.router({
        challengeList: t.procedure.query(async () => {
            return await databaseIOAPI.getChallengeList();
        }),
        challengeData: t.procedure.input(z.number()).query(async (opts) => {
            return await databaseIOAPI.getChallengeData(opts.input);
        }),
        createNewChallenge: t.procedure
            .input(CreateNewChallengeArgsParser)
            .mutation(async (opts) => {
            const { input } = opts;
            if (input.secret !== secret)
                return -1;
            return await databaseIOAPI.createNewChallenge(input.challenge);
        }),
        submitGraph: t.procedure
            .input(SubmitGraphArgsParser)
            .mutation(async (opts) => {
            const { input } = opts;
            const challenge = await databaseIOAPI.getChallengeData(input.challenge);
            if (!challenge)
                return SubmitGraphState.Error;
            const passed = await validationAPI.validateThatGraphPassesTestSuite({
                graphLink: input.graphLink,
                challengeID: input.challenge,
            });
            if (passed) {
                databaseIOAPI.submitGraph({
                    ...input,
                    graphStateScore: await validationAPI.getGraphStateLength(input.graphLink),
                    textModeScore: await validationAPI.getTextModeLength(input.graphLink),
                });
                return SubmitGraphState.Succeeded;
            }
            return SubmitGraphState.Failed;
        }),
        submissions: t.procedure
            .input(z.object({
            challengeID: z.number(),
            limit: z.number(),
            offset: z.number(),
        }))
            .query(async (opts) => {
            const { input } = opts;
            return await databaseIOAPI.getSubmissions(input);
        }),
    });
    return appRouter;
}
