import { getCommitMessagesBetween } from "./helpers/git.helpers.ts";
import {
  JiraConfig,
  JiraIssueDetail,
  getIssueIdFromCommitMessage,
  getJiraConfigFromEnv,
  searchForIssueDetails,
} from "./helpers/jira.helpers.ts";
import { formatReportMarkdown } from "./formatters.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";
import { generateJiraIssuesReportData } from "./helpers/report-generators.ts";

export type CommitDetail = {
  commitHash: string;
  commitMessage: string;
  jiraDetails?: JiraIssueDetail;
};

export async function doThings(
  firstCommitHash: string,
  lastCommitHash: string,
  jiraConfig: JiraConfig
) {
  const commitMessages = await getCommitMessagesBetween(
    firstCommitHash,
    lastCommitHash
  );

  if (!commitMessages.ok) {
    return commitMessages.error;
  }
  let commitDetails: CommitDetail[] = getCommitDetailsFromGitCommits(
    commitMessages.value
  );

  commitDetails = commitDetails.map((c) => addIssueIdToCommitDetails(c));

  const issueIds = commitDetails
    .filter((c) => !!c.jiraDetails?.issueId)
    .map((c) => c.jiraDetails?.issueId as string);
  const jiraDetails = await searchForIssueDetails(issueIds, jiraConfig);

  if (!jiraDetails.ok) {
    return jiraDetails.error;
  }

  commitDetails = commitDetails.map((c) =>
    mapJiraDetailsToCommitDetails(jiraDetails.value, c)
  );
  const jiraIssuesReportData = generateJiraIssuesReportData(jiraDetails.value);

  return formatReportMarkdown(jiraIssuesReportData);
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const env = await load();
  const { firstCommitHash, lastCommitHash, jiraConfig } = parseArguments(
    Deno.args,
    env
  );
  console.log(await doThings(firstCommitHash, lastCommitHash, jiraConfig));
}

function parseArguments(args: string[], env: Record<string, string>) {
  // if JIRA_API_KEY is set in environment variables use those to get jira config
  if (env["JIRA_API_KEY"]) {
    if (args.length < 2) {
      console.log("Please provide the following arguments: first commit hash, last commit hash");
      Deno.exit(1);
    }
    const firstCommitHash = args[0];
    const lastCommitHash = args[1];
    const jiraConfig = getJiraConfigFromEnv(env);
    return { firstCommitHash, lastCommitHash, jiraConfig };
  }
  if (args.length < 5) {
    console.error(
      "Please provide the following arguments: first commit hash, last commit hash, jira domain, jira username, jira api key"
    );
    Deno.exit(1);
  }
  const firstCommitHash = args[0];
  const lastCommitHash = args[1];
  const jiraConfig: JiraConfig = {
    jiraDomain: args[2],
    username: args[3],
    apikey: args[4],
  };
  return { firstCommitHash, lastCommitHash, jiraConfig };
}

function mapJiraDetailsToCommitDetails(
  jiraDetails: JiraIssueDetail[],
  commitDetail: CommitDetail
) {
  const jiraDetail = jiraDetails.find(
    (jiraDetail) => jiraDetail.issueId === commitDetail.jiraDetails?.issueId
  );
  if (!jiraDetail) {
    return commitDetail;
  }
  return {
    ...commitDetail,
    jiraDetails: {
      ...commitDetail.jiraDetails,
      summary: jiraDetail.summary,
      type: jiraDetail.type,
    },
  } as CommitDetail;
}

function getCommitDetailsFromGitCommits(commits: string[]) {
  return commits.map((commit) => ({
    commitHash: commit.split(" ")[0],
    commitMessage: commit.split(" ").slice(1).join(" "),
  }));
}

function addIssueIdToCommitDetails(commitDetails: CommitDetail) {
  const issueId = getIssueIdFromCommitMessage(commitDetails.commitMessage);
  if (issueId) {
    const c = commitDetails;
    if (!c.jiraDetails) {
      c.jiraDetails = {
        issueId: "",
        summary: "",
        type: "",
        url: "",
        status: "",
      };
    }
    c.jiraDetails.issueId = issueId;
    return c;
  }
  return commitDetails;
}
