import { JiraIssueDetail } from "./jira.helpers.ts";

export type JiraIssuesReportSection = {
  name: string;
  issues: JiraIssueDetail[];
};

export type JiraIssuesReportData = {
  sections: JiraIssuesReportSection[];
};

export function generateJiraIssuesReportData(
  jiraDetails: JiraIssueDetail[],
): JiraIssuesReportData {
  const sections = [];

  const issueTypes = getIssueTypes(jiraDetails);

  for (const issueType of issueTypes) {
    const issues = jiraDetails.filter((j) => j.type === issueType);
    const section = {
        // pluralise the issue type
      name: `${issueType}s`,
      issues,
    };
    sections.push(section);
  }
  return {
    sections,
  }
}

export function getIssueTypes(jiraDetails: JiraIssueDetail[]) {
  const issueTypes = jiraDetails.map((j) => j.type);
  return [...new Set(issueTypes)];
}
