# Monorepo for Label Push

<p align="left">
    中文 &nbsp ｜ &nbsp <a href="./README.md">English</a>
</p>

[![Auto Release](https://github.com/wy-luke/label-push/actions/workflows/release.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/release.yml)
[![Auto Publish](https://github.com/wy-luke/label-push/actions/workflows/publish.yml/badge.svg)](https://github.com/wy-luke/label-push/actions/workflows/publish.yml)

**Label Push** 可以向最后一个 `commit message` 中添加指定标签文本，然后再 `push`

> 有什么用呢？比如：你可以设置标签文本为“build”，从而实现在需要的时候触发流水线。

## 特点

- 向最后一个 `commit message` 中添加指定标签文本，然后再 `push`
- 当本地没有新的提交时，创建一个空提交（`empty commit`）
- 在添加标签文本前自动拉取（`pull`），确保标签被添加到最后一次提交
- 可以选择是否提交当前已暂存更改
- 可以选择是否发布分支，当远程分支不存在时
- 标签文本可以自定义

## 使用

可以通过以下几种方法使用 **Label Push**:

1. 打开 Command Palette (Ctrl+Shift+P / ⌘+Shift+P) 然后输入 `Label Push`
2. 点击位于 VS Code 底部状态条的 "Label Push":

   ![Status Bar Menu](https://github.com/wy-luke/label-push/blob/main/apps/vscode/resources/status-bar.jpeg)

3. 点击位于 Source Control 面板中的 Label Push 图标：:

   ![Souce Control View Navigation Menu](https://raw.githubusercontent.com/wy-luke/label-push/main/apps/vscode/resources/menu-navigation.png)

## 致谢

感谢以下项目，对我帮助很大:

- [Git Graph](https://github.com/mhutchie/vscode-git-graph)
- [Visual Studio Code](https://github.com/microsoft/vscode)

本项目的图标来自 [IconPark](https://github.com/bytedance/iconpark) from Bytedance.
