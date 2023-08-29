# release-notes-gen

## 🤔 What is this thing?

This is a little cli tool built using deno that generates release notes from jira tickets.
It is incomplete at this stage, but solved a problem I had.
It takes two git commits, finds every commit between them, extracts any Jira issue IDs within the commit messages and then prints the issue summaries for each issue found.

It can be used like this to generate release notes:

```
$ release-notes first-commit-sha last-commit-sha <your jira subdomain> <your jira username> <your jira api key>
# outputs (example):

## Bugs

- [Done] ABC-123: Posts don't load

## Tasks

- [Done] ABC-123: Ci/Cd setup

## Storys

- [Done] ABC-123: AAU IWT add a post STI can share a post with my subscribers

```

## 🛣️ Roadmap:

- get args properly.
- add new format that generates a markdown file with each jira ticket summary grouped by type
- add new format that returns all data as an ascii table (https://deno.land/x/ascii_table@v0.1.0#usage)
