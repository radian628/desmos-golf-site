import { A } from "@solidjs/router";
import { ChallengeData } from "../../../../server/src/db/db-io-api";

import "./ChallengePreview.less";

export function ChallengePreview(props: {
  challenge: () => ChallengeData;
  id: () => number;
}) {
  return (
    <A href={`/challenge/${props.id()}/submissions`}>
      <div class="challenge-preview">
        <h2>{props.challenge().name}</h2>
        <p>{props.challenge().desc}</p>
      </div>
    </A>
  );
}
