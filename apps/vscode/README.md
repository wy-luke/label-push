# Label Push extension for Visual Studio Code

<p align="left">
    <a href="./README_CN.md">中文</a> &nbsp ｜ &nbsp English
</p>

[![Auto Release](https://github.com/wy-luke/label-push/actions/workflows/release.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/release.yml)
[![Auto Publish](https://github.com/wy-luke/label-push/actions/workflows/publish.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/publish.yml)

**Label Push** could add a label text to your latest commit message and then push.

> What for? E.g., you could add a "build" label to trigger the CI/CD Pipeline when you want.

## Features

- Add a label text to your latest commit message and then push.
- Create an empty commit with the label text when there are no new commits locally.
- Pull automatically if necessary to make sure the label is added to the latest commit.
- You can choose whether to commit the changes already staged.
- You can choose whether to publish the branch that does not exist, or was deleted in the remote repository.
- The label text is configurable.

## Usage

You have several ways to use **Label Push**:

1. Open the Command Palette (Ctrl+Shift+P / ⌘+Shift+P) and type `Label Push`.
2. Click "Label Push" in the status bar.

   ![Status Bar Menu](https://github.com/wy-luke/label-push/blob/main/apps/vscode/resources/status-bar.jpeg)

3. Click the Label Push icon in the Source Control view, as shown below:

   ![Souce Control View Navigation Menu](https://raw.githubusercontent.com/wy-luke/label-push/main/apps/vscode/resources/menu-navigation.png)

## Extension Settings

- Label: The label text to be added to the commit message.

  - type: `string`
  - default: `[build]`

- ShowStatusBarItem: Whether to show "Label Push" status bar item.

  - type: `boolean`
  - default: `true`

- CommitEmpty: Whether to create an empty commit with the label when there are no new commits locally.

  - type: `string`
  - enum: `[Always, Never, Suggest]`
  - default: `Suggest`

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
