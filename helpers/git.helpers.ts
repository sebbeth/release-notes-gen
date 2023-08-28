import { Err, Ok } from "../result.ts";

export async function getCommitMessagesBetween(
    firstCommitHash: string,
    lastCommitHash: string
  ) {
    const process = new Deno.Command("git", {
      args: [
        "log",
        "--pretty=format:%h %s",
        "--no-merges",
        firstCommitHash + ".." + lastCommitHash,
      ],
    });

    const textDecoder = new TextDecoder();
    const out = textDecoder.decode((await process.output()).stdout).trim();

    const errors = textDecoder.decode((await process.output()).stderr).trim();

    if (errors) {
      return Err(errors);
    }

    return Ok(out.split("\n"));
  }