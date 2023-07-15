import {
  ChallengeData,
  ChallengeSubmission,
  DatabaseIOAPI,
} from "./db-io-api.js";

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DataSource,
  ManyToOne,
} from "typeorm";

@Entity("Challenge")
export class Challenge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  desc!: string;

  @Column()
  testSuite!: string;
}

@Entity("Submission")
export class Submission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  creator!: string;

  @Column()
  desc!: string;

  @Column()
  graphLink!: string;

  @Column()
  graphStateScore?: number;

  @Column()
  textModeScore?: number;

  @Column()
  challenge!: number;
}

export default async function sqlite3DatabaseAPI(): Promise<DatabaseIOAPI> {
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
      return (
        (await AppDataSource.getRepository(Challenge).findOne({
          where: {
            id: cid,
          },
        })) ?? undefined
      );
    },

    async getChallengeList() {
      return (
        await AppDataSource.getRepository(Challenge).find({
          select: {
            id: true,
          },
        })
      ).map((c) => c.id);
    },

    async getSubmissions(opts) {
      return await AppDataSource.getRepository(Submission).find({
        where: {
          challenge: opts.challengeID,
        },
        take: opts.limit,
        skip: opts.offset,
        order: {
          textModeScore: {
            direction: "ASC",
          },
        },
      });
    },

    async submitGraph(submission) {
      await AppDataSource.getRepository(Submission).insert(submission);
      return true;
    },

    async createNewChallenge(info) {
      console.log("createnewchallenge", info);
      const challenge = await AppDataSource.getRepository(Challenge).insert(
        info
      );
      return challenge.raw;
    },
  };
}
