import { ChallengeSubmission } from "../../../../server/src/db/db-io-api";
import {
  Horizontal,
  NarrowShow,
  TypeVariant,
  Vertical,
  useFetchDesmosJson,
} from "../common/utils";
import "./SubmissionDisplay.less";

export function SubmissionDisplay(props: {
  submission: () => ChallengeSubmission;
}) {
  const [graph] = useFetchDesmosJson(() => props.submission().graphLink);

  return (
    <div class="submission-display">
      <NarrowShow
        data={graph}
        cond={(graph): graph is TypeVariant<typeof graph, "success"> =>
          graph.type === "success"
        }
        true={(graph) => (
          <Horizontal>
            <Vertical>
              <h3>
                <a href={props.submission().graphLink}>{graph.data.title}</a> by{" "}
                {props.submission().creator}
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
              <img src={graph.data.thumbUrl as string}></img>
            </div>
          </Horizontal>
        )}
        false={() => "Loading..."}
      ></NarrowShow>
    </div>
  );
}
