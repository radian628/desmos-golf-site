import { A } from "@solidjs/router";
import { ChallengeData } from "../../../../server/src/db/db-io-api";

import "./ChallengePreview.less";
import { Link } from "../common/better-router/BetterRoute";

export function ChallengePreview(props: {
  challenge: () => ChallengeData;
  id: () => number;
}) {
  return (
    <Link to={() => `/challenge/${props.id()}/submissions`}>
      <div class="challenge-preview">
        <h2>{props.challenge().name}</h2>
        <p>{props.challenge().desc}</p>
      </div>
    </Link>
  );
}
