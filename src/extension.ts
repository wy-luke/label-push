import * as vscode from 'vscode'
import { GitErrorCodes, GitExtension } from './git'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('tag-push')

  let terminal: vscode.Terminal | undefined

  let disposable = vscode.commands.registerCommand('tag-push.tagPush', async () => {
    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('Tag push')
    outputChannel.show()

    // 获取当前项目的根路径
    const workspaceRoot = vscode.workspace.workspaceFolders

    if (!workspaceRoot) {
      outputChannel.appendLine('No workspace folder opened')
      return
    }

    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
    const git = gitExtension?.getAPI(1)

    const repo = git?.getRepository(workspaceRoot[0].uri)

    if (!repo) {
      outputChannel.appendLine('The workspace folder opened is not a git repo')
      return
    }

    const state = repo.state

    // 无远程仓库
    if (state.remotes.length === 0) {
      vscode.window.showErrorMessage('未设置远程仓库')
      outputChannel.appendLine('No remotes')
      return
    }

    // 无远程分支
    if (!state.HEAD?.upstream) {
      vscode.window.showInformationMessage('当前分支未设置远程分支')
      // TODO: 询问是否直接推送
      return
    }

    // 工作区存在修改
    if (state.workingTreeChanges.length !== 0) {
      vscode.window.showInformationMessage('当前工作区存在修改')
    }

    // 暂存区存在修改
    if (state.indexChanges.length !== 0) {
      vscode.window.showInformationMessage('当前暂存区存在修改')
      // TODO: 提示用户是否提交暂存区修改，是、否、总是、永不
    }

    // 远程分支存在新的提交，需要拉取
    if (state.HEAD?.behind !== 0) {
      try {
        outputChannel.appendLine(`Start to pull`)
        await repo.pull()
        outputChannel.appendLine(`Pull successfully`)
      } catch (error) {
        if ((error as any).gitErrorCode === GitErrorCodes.Conflict) {
          outputChannel.appendLine(`Pull resulted in conflicts`)
          vscode.window.showInformationMessage('存在冲突，请解决')
        } else {
          outputChannel.appendLine(`Pull failed: ${error}`)
        }
      }
    }

    if (!terminal) {
      // 如果不存在，创建新终端
      terminal = vscode.window.createTerminal({
        name: `Tag push`,
        cwd: workspaceRoot[0].uri.fsPath,
      })

      // 注册关闭事件，当终端被关闭时清空引用
      context.subscriptions.push(
        vscode.window.onDidCloseTerminal((closedTerminal) => {
          if (closedTerminal === terminal) {
            terminal = undefined
          }
        }),
      )
    }

    // 本地存在新的提交
    if (state.HEAD?.ahead !== 0) {
      outputChannel.appendLine('There is new commit locally')
      outputChannel.appendLine(
        `execute: git commit --amend -o -m"$(git log --format=%B -n1)" -m"${config.tag}" && git push`,
      )
      terminal.sendText(
        `git commit --amend -o -m"$(git log --format=%B -n1)" -m"${config.tag}" && git push`,
      )
    } else {
      // 本地无新的提交
      outputChannel.appendLine('There is no new commit locally')
      outputChannel.appendLine(
        `execute: git commit --allow-empty -m"build: ${config.tag}" && git push`,
      )
      terminal.sendText(`git commit --allow-empty -m"build: ${config.tag}" && git push`)
    }

    terminal.show()

    // const lastCommit = await repo.getCommit("HEAD");
    // const commitMessage = `${lastCommit.message}\n\n[build]`;
    // await repo.commit(commitMessage, { amend: true });

    // repo.push()
  })

  context.subscriptions.push(disposable)
}
