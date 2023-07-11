import { createSignal } from "solid-js";
import { ChallengeData } from "../../../../server/src/db/db-io-api";
import "./AddOrUpdateNewChallengeForm.less";
import { makeObjPropSetter } from "./utils";

export function AddOrUpdateNewChallengeForm(props: {
  name: () => string;
  get: () => ChallengeData;
  set: (c: ChallengeData) => void;
  submit: (secret: string) => void;
}) {
  const [secret, setSecret] = createSignal("");

  const set = makeObjPropSetter(props.get, props.set);

  return (
    <>
      <h2>{props.name()}</h2>
      <div class="add-or-update-new-challenge-form">
        <div class="input-label-pair">
          <label>Name</label>
          <input
            value={props.get().name}
            onChange={(e) => set("name")(e.target.value)}
          ></input>
        </div>
        <div class="input-label-pair">
          <label>Description</label>
          <textarea
            value={props.get().desc}
            onChange={(e) => set("desc")(e.target.value)}
          ></textarea>
        </div>
        <div class="input-label-pair">
          <label>Password </label>
          <input
            type="password"
            value={secret()}
            onChange={(e) => {
              setSecret(e.target.value);
            }}
          ></input>
        </div>
        <button
          onClick={() => {
            props.submit(secret());
          }}
        >
          Submit
        </button>
      </div>
    </>
  );
}
