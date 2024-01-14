# Changelog

All notable changes to the "tag-push" extension will be documented in this file.

## [0.1.4] - 2024-01-14

### Added

feat: add the status bar item
feat: add a config about whether to commit empty, false by default

### Fixed

fix: remove outputChannel.show() every start

## [0.1.3] - 2024-01-12

### Added

- feat: fetch before check remote
- feat: suggest when remote branch was deleted

## [0.1.2] - 2024-01-11

### Fixed

- fix: avoid creating empty commits when no remote branch
- fix: retrieve config after changes
- fix: check addStagedOrNot when create empty commits

## [0.1.1] - 2024-01-11

### Fixed

- fix: return when catch error after pull

### Changed

- refactor: change `config.pushBranch` to `config.publishBranch`

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
