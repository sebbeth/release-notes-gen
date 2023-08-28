import { JiraIssuesReportData } from "./helpers/report-generators.ts";
import { CommitDetail } from "./main.ts";
import prettier from "npm:prettier";

export type formatOptions = "inline" | "markdown";

export function format(
  commitDetails: CommitDetail[],
  formatOption: formatOptions = "inline"
) {
  switch (formatOption) {
    default:
      return formatInline(commitDetails);
  }
}

function formatInline(commitDetails: CommitDetail[]) {
  const formatted = commitDetails
    .map((c) => {
      if (c.jiraDetails) {
        return (
          `${c.commitHash} ${c.commitMessage} ` +
          `JIRA: ${c.jiraDetails.issueId.toLocaleUpperCase()} ` +
          `${c.jiraDetails.type.toLocaleUpperCase()} ` +
          `${c.jiraDetails.summary} ` +
          `${c.jiraDetails.url}`
        );
      }
      return `${c.commitHash} ${c.commitMessage}`;
    })
    // escape any newline characters
    .map((c) => c.replace(/\n/g, "\\n"));
  return formatted.join("\n");
}

export function formatReportMarkdown(jiraIssuesReportData: JiraIssuesReportData) {
    let output = "";
    const {sections} = jiraIssuesReportData;
    for (const section of sections) {
        output += `## ${section.name}\n`;
        for (const issue of section.issues) {
            output += `- [${issue.status}] ${issue.issueId}: ${issue.summary} ${issue.url}\n`;
        }
    }
    // format the markdown
    const formatted = prettier.format(output, { parser: "markdown", proseWrap: "always" });
    return formatted;
}