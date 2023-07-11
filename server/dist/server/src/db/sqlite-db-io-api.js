import { Sequelize, DataTypes } from "sequelize";
export default function sqlite3DatabaseAPI() {
    const sequelize = new Sequelize("sqlite:db/db.sqlite3");
    const Challenge = sequelize.define("Challenge", {
        name: DataTypes.STRING,
        desc: DataTypes.STRING,
        testSuite: DataTypes.STRING,
    });
    const Submission = sequelize.define("ChallengeSubmission", {
        challenge: {
            type: DataTypes.INTEGER,
            references: {
                model: Challenge,
                key: "rowid",
            },
        },
        creator: DataTypes.STRING,
        graphLink: DataTypes.STRING,
        graphStateScore: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        textModeScore: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        desc: DataTypes.STRING,
    });
    Challenge.sync();
    Submission.sync();
    return {
        async getChallengeData(cid) {
            const challenge = await Challenge.findByPk(cid);
            return challenge === null || challenge === void 0 ? void 0 : challenge.dataValues;
        },
        async getChallengeList() {
            return ((await Challenge.findAll({
                attributes: ["id"],
            }))
                // needed because sequelize has awful typesafety
                // @ts-expect-error
                .map((c) => c.dataValues.id));
        },
        async getSubmissions(cid) {
            const submissions = await Submission.findAll({
                where: {
                    challenge: cid,
                },
            });
            return submissions.map((e) => e.dataValues);
        },
        async submitGraph(submission) {
            const result = await Submission.create(submission);
            return true;
        },
        async createNewChallenge(info) {
            const challenge = await Challenge.create(info);
            return true;
        },
    };
}
