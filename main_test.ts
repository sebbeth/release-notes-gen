import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.188.0/testing/asserts.ts";
import { doThings } from "./main.ts";
import { getJiraConfigFromEnv } from "./helpers/jira.helpers.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

// TODO these should probably be actual integration tests or something and just run the executable
Deno.test("It errors if first commit sha is invalid", async () => {
  const env = await load();
  const jiraConfig = getJiraConfigFromEnv(env);

  const result = await doThings(
    "zzz",
    "00da57b2e812cc276950d18beac7e1f428d90678",
    jiraConfig
  );
  assertStringIncludes(result as string, "fatal");
});

Deno.test("It returns correct things", async () => {
  const env = await load();
  const jiraConfig = getJiraConfigFromEnv(env);

  const result = await doThings(
    "fa3308587fe0c3fae3eb449bf8a4c31e6b2aedee", // first commit
    "HEAD",
    jiraConfig
  );

  assertEquals(result, "00da57b second commit");
});
