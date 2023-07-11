var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, DataSource, ManyToOne, } from "typeorm";
export let Challenge = class Challenge {
    id;
    name;
    desc;
    testSuite;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Challenge.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Challenge.prototype, "name", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Challenge.prototype, "desc", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Challenge.prototype, "testSuite", void 0);
Challenge = __decorate([
    Entity("Challenge")
], Challenge);
export let Submission = class Submission {
    id;
    creator;
    desc;
    graphLink;
    graphStateScore;
    textModeScore;
    challenge;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Submission.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Submission.prototype, "creator", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Submission.prototype, "desc", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Submission.prototype, "graphLink", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Submission.prototype, "graphStateScore", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Submission.prototype, "textModeScore", void 0);
__decorate([
    ManyToOne(() => Challenge),
    __metadata("design:type", Number)
], Submission.prototype, "challenge", void 0);
Submission = __decorate([
    Entity("Submission")
], Submission);
export default async function sqlite3DatabaseAPI() {
    const AppDataSource = new DataSource({
        type: "sqlite",
        database: "./db/db.sqlite3",
        synchronize: true,
        entities: [Challenge, Submission],
        logging: ["error", "query", "schema", "info", "log", "migration", "warn"],
    });
    await AppDataSource.initialize();
    console.log(await AppDataSource.getRepository(Challenge).findAndCount());
    return {
        async getChallengeData(cid) {
            return ((await AppDataSource.getRepository(Challenge).findOne({
                where: {
                    id: cid,
                },
            })) ?? undefined);
        },
        async getChallengeList() {
            return (await AppDataSource.getRepository(Challenge).find({
                select: {
                    id: true,
                },
            })).map((c) => c.id);
        },
        async getSubmissions(cid) {
            return await AppDataSource.getRepository(Submission).find({
                where: {
                    challenge: cid,
                },
            });
        },
        async submitGraph(submission) {
            await AppDataSource.getRepository(Submission).create(submission);
            return true;
        },
        async createNewChallenge(info) {
            console.log("createnewchallenge", info);
            const challenge = await AppDataSource.getRepository(Challenge).insert(info);
            return challenge.raw;
        },
    };
}
