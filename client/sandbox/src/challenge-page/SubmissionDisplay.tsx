import { Show } from "solid-js";
import { ChallengeSubmission } from "../../../../server/src/db/db-io-api";
import { Horizontal, Vertical, useFetchDesmosJson } from "../common/utils";
import "./SubmissionDisplay.less";

export function SubmissionDisplay(props: {
  submission: () => ChallengeSubmission;
}) {
  const [graph] = useFetchDesmosJson(() => props.submission().graphLink);

  return (
    <div class="submission-display">
      {graph().type === "success" ? (
        <Horizontal>
          <Vertical>
            <h3>
              <a href={props.submission().graphLink}>
                {(graph() as any).data.title as string}
              </a>{" "}
              by {props.submission().creator}
            </h3>
            <p>
              {props.submission().desc === ""
                ? "No description provided."
                : props.submission().desc}
            </p>
            <p>Text Mode: {props.submission().textModeScore} bytes</p>
            <p>Graph State: {props.submission().graphStateScore} bytes</p>
          </Vertical>
          <div
            style={{
              "flex-grow": "1",
              display: "flex",
              "justify-content": "right",
            }}
          >
            <img src={(graph() as any).data.thumbUrl as string}></img>
          </div>
        </Horizontal>
      ) : graph().type === "pending" ? (
        "Loading..."
      ) : (
        "Failed to load this submission, as the graph does not exist."
      )}
    </div>
  );
}
