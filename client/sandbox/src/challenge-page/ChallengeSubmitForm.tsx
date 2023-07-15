import { Portal } from "solid-js/web";
import { Tooltip } from "../common/Tooltip";
import { trpc } from "../communication/trpc-setup";
import { createSignal } from "solid-js";
import "./ChallengeSubmitForm.less";

export function useLocalStorage(itemName: string, fallback: string) {
  return [
    () => {
      return localStorage.getItem(itemName) ?? fallback;
    },
    (content: string) => {
      localStorage.setItem(itemName, content);
    },
  ] as const;
}

export function ChallengeSubmitForm(props: {
  challengeID: () => number;
  graphLink: () => string;
  close: () => void;
}) {
  const [creator, setCreator] = useLocalStorage("submissionCreator", "");

  const [description, setDescription] = createSignal("");

  return (
    <Portal>
      <div class="challenge-submit-form">
        <div class="popup-close-button-container">
          <Tooltip
            contents={() =>
              "Note: Closing this popup will require you to resubmit."
            }
          >
            <button onClick={props.close}>X</button>
          </Tooltip>
        </div>
        <h2>Submit</h2>
        <label>Creator</label>
        <p>
          Who created this graph? Put a username here, or leave blank to remain
          anonymous.
        </p>
        <input
          value={creator()}
          onInput={(e) => {
            setCreator(e.currentTarget.value);
          }}
        ></input>
        <label>Description</label>
        <p>
          What improvements did you make over previous submissions to this
          challenge? What insights did you uncover? You may leave this empty if
          you want.
        </p>
        <textarea
          value={description()}
          onInput={(e) => {
            setDescription(e.currentTarget.value);
          }}
        ></textarea>
        <br></br>
        <button
          onClick={() => {
            trpc.submitGraph.mutate({
              desc: description(),
              challenge: props.challengeID(),
              graphLink: props.graphLink(),
              creator: creator(),
            });
          }}
        >
          Submit
        </button>
      </div>
    </Portal>
  );
}
