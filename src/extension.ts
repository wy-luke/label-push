import * as vscode from 'vscode'
import { GitErrorCodes, GitExtension } from './git'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "tag-push" is now active!')

  let terminal: vscode.Terminal | undefined

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('tag-push.tagPush', async () => {
    // 获取当前项目的根路径
    const workspaceRoot = vscode.workspace.workspaceFolders

    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
    const git = gitExtension?.getAPI(1)

    if (!workspaceRoot || !git) {
      return
    }

    const repo = git.getRepository(workspaceRoot[0].uri)
    if (!repo) {
      vscode.window.showErrorMessage(`当前目录非Git仓库`)
      return
    }

    const state = repo.state

    // 无 remote
    if (state.remotes.length === 0 || !state.HEAD?.upstream) {
      vscode.window.showInformationMessage('当前分支未设置远程分支')
      return
    }

    // 工作区存在修改
    if (state.workingTreeChanges.length !== 0) {
      vscode.window.showInformationMessage('当前工作区存在修改')
    }

    // 暂存区存在修改
    if (state.indexChanges.length !== 0) {
      vscode.window.showInformationMessage('当前暂存区存在修改')
      // TODO:提示用户是否提交暂存区修改，是、否、永不
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

    const config = vscode.workspace.getConfiguration('tag-push')

    // Remote存在新的提交，需要拉取
    if (state.HEAD?.behind !== 0) {
      try {
        await repo.pull()
        vscode.window.showInformationMessage('Pull successful')
      } catch (error) {
        if ((error as any).gitErrorCode === GitErrorCodes.Conflict) {
          vscode.window.showErrorMessage('Pull resulted in conflicts. Please resolve them.')
        } else {
          vscode.window.showErrorMessage(`Error pulling: ${error}`)
        }
      }
    }

    // 本地存在新的提交
    if (state.HEAD?.ahead !== 0) {
      terminal.sendText(`git commit --amend -o -m"$(git log --format=%B -n1)" -m"${config.tag}"`)
    } else {
      // 本地无新的提交
      vscode.window.showInformationMessage('当前无修改')
      terminal.sendText(`git commit --allow-empty -m"build: ${config.tag}"`)
      return
    }

    terminal.show()

    // const lastCommit = await repo.getCommit("HEAD");
    // const commitMessage = `${lastCommit.message}\n\n[build]`;
    // await repo.commit(commitMessage, { amend: true });

    repo.push()

    // if (workspaceRoot) {
    //   if (!terminal) {
    //     // 如果不存在，创建新终端
    //     terminal = vscode.window.createTerminal({
    //       name: `Tag push`,
    //       cwd: workspaceRoot[0].uri.fsPath,
    //     });

    //     // 注册关闭事件，当终端被关闭时清空引用
    //     context.subscriptions.push(
    //       vscode.window.onDidCloseTerminal((closedTerminal) => {
    //         if (closedTerminal === terminal) {
    //           terminal = undefined;
    //         }
    //       }),
    //     );
    //   }

    //   terminal.sendText(
    //     `git merge 4baa3be483b6fbff8559a327370eaa5aaa83c733;`,
    //   );
    //   terminal.sendText(
    //     `
    //   git commit --amend -m"$(git log --format=%B -n1)" -m"[build]"`,
    //   );
    //   terminal.show();
    // } else {
    //   vscode.window.showErrorMessage(
    //     "No workspace opened. Please open a workspace before executing this command.",
    //   );
    // }
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
