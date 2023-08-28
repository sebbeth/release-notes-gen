// deno-lint-ignore-file no-explicit-any
import { Err, Ok } from "../result.ts";

export type JiraIssueDetail = {
  issueId: string;
  summary: string;
  type: string;
  url: string;
  status: string;
};
export type JiraConfig = {
  apikey: string;
  username: string;
  jiraDomain: string;
};

export function getJiraConfigFromEnv(env: Record<string, string>) {
  // null check each env var
  if (!env["JIRA_API_KEY"]) {
    throw new Error("JIRA_API_KEY env var not set");
  }
  if (!env["JIRA_USERNAME"]) {
    throw new Error("JIRA_USERNAME env var not set");
  }
  if (!env["JIRA_DOMAIN"]) {
    throw new Error("JIRA_DOMAIN env var not set");
  }

  const jiraConfig: JiraConfig = {
    apikey: env["JIRA_API_KEY"],
    username: env["JIRA_USERNAME"],
    jiraDomain: env["JIRA_DOMAIN"],
  };
  return jiraConfig;
}

export function getIssueIdFromCommitMessage(commitMessage: string) {
  // search for a jira issue id in a commit message
  const regex = /([A-Z]+-\d+)/g;
  const matches = commitMessage.match(regex);
  if (matches && matches.length > 0) {
    return matches[0];
  }
  return undefined;
}

export function generateIssueUrl(issueId: string, jiraConfig: JiraConfig) {
  return `https://${jiraConfig.jiraDomain}.atlassian.net/browse/${issueId}`;
}

function generateBody(issueIds: string[]) {
  const deDupedIssueIds = [...new Set(issueIds)];
  return {
    jql: `issueKey in (${deDupedIssueIds.join(",")})`,
    fields: ["summary", "issuetype", "status"],
  };
}

export async function searchForIssueDetails(
  issueIds: string[],
  jiraConfig: JiraConfig
) {
  // base 64 encode the username and api key
  const authToken = btoa(`${jiraConfig.username}:${jiraConfig.apikey}`);

  // fetch the issue details
  const data = await fetch(
    `https://${jiraConfig.jiraDomain}.atlassian.net/rest/api/2/search?jql=issueKey`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(generateBody(issueIds)),
    }
  );

  if (!data.ok) {
    console.error(data);
    return Err(`Error fetching issues ${data.statusText}`);
  }
  const json = await data.json();
  return Ok(parseOutput(json, jiraConfig));
}

function parseOutput(json: any, jiraConfig: JiraConfig) {
  return json.issues.map(
    (issue: any) =>
      ({
        issueId: issue.key,
        summary: issue.fields.summary,
        type: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        url: generateIssueUrl(issue.key, jiraConfig),
      } as JiraIssueDetail)
  );
}
