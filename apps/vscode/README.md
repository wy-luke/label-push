# Tag Push extension for Visual Studio Code

[![Auto Release](https://github.com/wy-luke/tag-push/actions/workflows/release.yml/badge.svg)](https://github.com/wy-luke/tag-push/actions/workflows/release.yml)
[![Auto Publish](https://github.com/wy-luke/tag-push/actions/workflows/publish.yml/badge.svg)](https://github.com/wy-luke/tag-push/actions/workflows/publish.yml)

**Tag Push** could add a tag string to your latest commit message and then push.

> What for? E.g., you could add a "build" tag to trigger the CI/CD Pipeline when you want.

## Features

- Add a tag string to your latest commit message and then push.
- Create an empty commit with the tag string when there are no new commits locally, which is disabled by default.
- The tag string is configurable.
- Pull automatically if necessary.
- You can choose whether to commit the changes staged.
- You can choose whether to publish the branch that does not exist, or was deleted in the remote repository.

## Usage

You have several ways to use **Tag Push**:

1. Open the Command Palette (Ctrl+Shift+P / ⌘+Shift+P) and type `Tag Push`.
2. Click "Tag Push" in the status bar.
3. Click the "Tag Push" icon in the Source Control view, as shown below:

   ![Souce Control View Navigation Menu](https://raw.githubusercontent.com/wy-luke/tag-push/main/resources/menu-navigation.png)

## Extension Settings

- Tag: The tag string added to the commit message.

  - type: `string`
  - default: `[build]`

- CommitEmpty: Whether to create an empty commit with the tag when there are no new commits locally.

  - type: `boolean`
  - default: `false`

- ShowStatusBarItem: Whether to show "Tag Push" status bar item.

  - type: `boolean`
  - default: `true`

- PublishBranch: Whether to publish the branch that does not exist in the remote repository.

  - type: `string`
  - enum: `[Always, Never, Suggest]`
  - default: `Suggest`

- publishDeletedBranch: Whether to publish the branch that was deleted in the remote repository.

  - type: `string`
  - enum: `[Always, Never, Suggest]`
  - default: `Suggest`

- AddStaged: Whether to add the changes staged.
  - type: `string`
  - enum: `[Always, Never, Suggest]`
  - default: `Suggest`

## Release Notes

Detailed Release Notes are available [here](CHANGELOG.md).

## Acknowledgements

Thanks for the following projects, which inspired me a lot:

- [Git Graph](https://github.com/mhutchie/vscode-git-graph)
- [Visual Studio Code](https://github.com/microsoft/vscode)

The icons used are from [IconPark](https://github.com/bytedance/iconpark) from Bytedance.
