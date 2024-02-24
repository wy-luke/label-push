# Monorepo for Label Push

[![Auto Release](https://github.com/wy-luke/label-push/actions/workflows/release.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/release.yml)
[![Auto Publish](https://github.com/wy-luke/label-push/actions/workflows/publish.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/publish.yml)

**Label Push** could add a label text to your latest commit message and then push.

> What for? E.g., you could add a "build" label to trigger the CI/CD Pipeline when you want.

## Features

- Add a label text to your latest commit message and then push.
- Create an empty commit with the label when there are no new commits locally.
- Pull automatically if necessary to make sure the label is added to the latest commit.
- You can choose whether to commit the changes already staged.
- You can choose whether to publish the branch that does not exist, or was deleted in the remote repository.
- The label text is configurable.

## Release Notes

Detailed Release Notes are available [here](CHANGELOG.md).

## Acknowledgements

Thanks for the following projects, which inspired me a lot:

- [Git Graph](https://github.com/mhutchie/vscode-git-graph)
- [Visual Studio Code](https://github.com/microsoft/vscode)

The icons used are from [IconPark](https://github.com/bytedance/iconpark) from Bytedance.
