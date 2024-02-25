# Changelog

All notable changes to the "label-push" extension will be documented in this file.

## [0.2.1] - 2024-01-24

### Fixed

fix: hide terminal

### Changed

fix: check staging area only when have new commits

## [0.2.0] - 2024-01-15

### Changed

Change version number to 0.2.0

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

First version of **Label Push**.

### Added

- Add a label to the latest commit's message and then push.
- Create an empty commit with the label when there are no new commits locally.
- Set the words as the label in the extension setting.
- Pull automatically when necessary.
- Use git extension bundled in VS Code to detect local git repository.
- Use termial to execute git commands.
- Select whether to keep the changes staged.
- Select whether to publish the branch that does not exist in the remote repository.