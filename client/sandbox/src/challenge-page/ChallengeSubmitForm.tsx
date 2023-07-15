import { Portal } from "solid-js/web";
import { Tooltip } from "../common/Tooltip";
import { trpc } from "../communication/trpc-setup";
import { Match, Show, Switch, createSignal } from "solid-js";
import "./ChallengeSubmitForm.less";
import { SubmitGraphState } from "../../../../server/src/api/client-server-api";
import { asyncify } from "../common/utils";

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

  const [submitState, setSubmitState] = createSignal<
    Promise<SubmitGraphState> | undefined
  >();

  const awaitedSubmitState = asyncify(
    () => submitState() ?? Promise.resolve(undefined)
  );

  return (
    <Portal>
      <div class="challenge-submit-form">
        <div class="popup-close-button-container">
          <Tooltip
            contents={() =>
              submitState() === undefined
                ? "Note: Closing this popup right now will require you to resubmit."
                : ""
            }
          >
            <button onClick={props.close}>X</button>
          </Tooltip>
        </div>
        <Show
          when={submitState() === undefined}
          fallback={
            <>
              <Switch
                fallback={"Waiting for the server to verify your solution..."}
              >
                <Match
                  when={awaitedSubmitState() === SubmitGraphState.Succeeded}
                >
                  Verification successful!
                </Match>
                <Match when={awaitedSubmitState() === SubmitGraphState.Failed}>
                  Verification failed!
                </Match>
                <Match when={awaitedSubmitState() === SubmitGraphState.Error}>
                  Verification encountered an unexpected error!{" "}
                  <a href="https://github.com/radian628/desmos-golf-site/issues">
                    Open an issue here with the graph and challenge information
                    and we'll see if we can get it fixed!
                  </a>
                </Match>
              </Switch>
              <p>You can safely close this popup and/or this entire window.</p>
            </>
          }
        >
          <h2>Submit</h2>
          <label>Creator</label>
          <p>
            Who created this graph? Put a username here, or leave blank to
            remain anonymous.
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
            challenge? What insights did you uncover? You may leave this empty
            if you want.
          </p>
          <textarea
            value={description()}
            onInput={(e) => {
              setDescription(e.currentTarget.value);
            }}
          ></textarea>
          <br></br>
          <button
            onClick={async () => {
              setSubmitState(
                trpc.submitGraph.mutate({
                  desc: description(),
                  challenge: props.challengeID(),
                  graphLink: props.graphLink(),
                  creator: creator(),
                })
              );
            }}
          >
            Submit
          </button>
        </Show>
      </div>
    </Portal>
  );
}
