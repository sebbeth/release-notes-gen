// from https://www.huy.rocks/everyday/02-14-2022-typescript-implement-rust-style-result
export type Result<T, E = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: E | undefined };

export const Ok = <T>(data: T): Result<T, never> => {
  return { ok: true, value: data };
};

export const Err = <E>(error?: E): Result<never, E> => {
  return { ok: false, error };
};
