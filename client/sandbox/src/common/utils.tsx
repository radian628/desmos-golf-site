export function makeObjPropSetter<T, K extends keyof T>(
  obj: () => T,
  setObj: (t: T) => void
): (k: K) => (v: T[K]) => void {
  return function (k) {
    return (v) =>
      setObj({
        ...obj(),
        [k]: v,
      });
  };
}
