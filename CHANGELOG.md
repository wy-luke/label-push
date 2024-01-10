# Changelog

All notable changes to the "tag-push" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-01-11

First version of **Tag Push**.

### Added

- Add a tag to the latest commit's message and then push.
- Create an empty commit with the tag when there are no new commits locally.
- Set the words as the tag in the extension setting.
- Pull automatically when necessary.
- Use git extension bundled in VS Code to detect local git repository.
- Use termial to execute git commands.
- Select whether to keep the changes staged.
- Select whether to publish the branch that does not exist in the remote repository.
