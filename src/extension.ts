import * as vscode from 'vscode'
import { GitErrorCodes, GitExtension, Repository } from './git'
import { ConfigOptions, DialogPick } from './types'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('Tag Push')
  outputChannel.appendLine(getTimeStamp() + 'Starting Tag Push......')

  // 获取当前项目的根路径
  const workspaceRoot = vscode.workspace.workspaceFolders

  if (!workspaceRoot) {
    outputChannel.appendLine(getTimeStamp() + 'Error: No workspace folder opened')
    return
  }

  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
  const git = gitExtension?.getAPI(1)

  if (!git) {
    outputChannel.appendLine(getTimeStamp() + 'Error: The git extension not found')
    return
  }

  let currentRepo: Repository | null = null

  outputChannel.appendLine(
    getTimeStamp() + `${git.repositories.length.toString()} repositories detected`,
  )
  if (git.repositories.length > 0) {
    currentRepo = git.repositories[0]
    outputChannel.appendLine(getTimeStamp() + `Set git repository: ${git.repositories[0].rootUri}`)
  } else {
    git.onDidOpenRepository((repo) => {
      currentRepo = repo
      outputChannel.appendLine(
        getTimeStamp() + `${git.repositories.length.toString()} repositories detected`,
      )
      outputChannel.appendLine(getTimeStamp() + `Set git repository: ${repo.rootUri}`)
      outputChannel.appendLine(getTimeStamp() + 'Start successfully')
    })
  }

  let config = vscode.workspace.getConfiguration('tag-push')
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('tag-push')) {
      config = vscode.workspace.getConfiguration('tag-push')
    }
  })

  let terminal: vscode.Terminal | null = null

  if (currentRepo) {
    outputChannel.appendLine(getTimeStamp() + 'Start successfully')
  }

  outputChannel.show()

  let disposable = vscode.commands.registerCommand('tag-push.tagPush', async () => {
    if (!currentRepo) {
      outputChannel.appendLine(getTimeStamp() + 'Error: No git repository was detected')
      return
    }

    let pushOrNot = true
    let addStagedOrNot = false

    const state = currentRepo.state

    // 无远程仓库
    if (state.remotes.length === 0) {
      vscode.window.showErrorMessage('未设置远程仓库')
      outputChannel.appendLine('Error: Remote repository not found')
      return
    }

    await currentRepo.fetch({ prune: true })

    // 无远程分支
    if (!state.HEAD?.upstream) {
      if (config.publishBranch === ConfigOptions.Suggest) {
        const pick = await showDialog(
          '当前分支未设置远程分支，是否直接推送？',
          config,
          'publishBranch',
        )
        if (pick === DialogPick.Cancle) {
          return
        }
        pushOrNot = pick === DialogPick.Yes
      } else {
        pushOrNot = config.publishBranch === ConfigOptions.Always
      }
    }

    // 暂存区存在修改
    if (state.indexChanges.length !== 0) {
      if (config.addStaged === ConfigOptions.Suggest) {
        const pick = await showDialog('当前暂存区存在修改，是否提交？', config, 'addStaged')
        if (pick === DialogPick.Cancle) {
          return
        }
        addStagedOrNot = pick === DialogPick.Yes
      } else {
        addStagedOrNot = config.addStaged === ConfigOptions.Always
      }
    }
    // else if (state.workingTreeChanges.length !== 0) {
    // 暂存区无修改，但工作区存在修改
    // addWorkingTree = await showDialog(
    //   '当前暂存区无修改，工作区存在修改，是否直接提交？',
    //   config,
    //   'addWorkingTree',
    // )
    // }

    // 远程分支存在新的提交，需要拉取
    if (state.HEAD?.behind !== 0) {
      try {
        outputChannel.appendLine(`Start to pull......`)
        await currentRepo.pull()
        outputChannel.appendLine(`Pull successfully`)
      } catch (error) {
        if ((error as any).gitErrorCode === GitErrorCodes.Conflict) {
          outputChannel.appendLine(`Pull resulted in conflicts`)
          vscode.window.showInformationMessage('存在冲突，请解决后再次提交')
        } else {
          outputChannel.appendLine(`Pull failed: ${error}`)
        }
        return
      }
    }

    if (!terminal) {
      // 如果不存在，创建新终端
      terminal = vscode.window.createTerminal({
        name: `Tag Push`,
        cwd: workspaceRoot[0].uri.fsPath,
      })

      // 注册关闭事件，当终端被关闭时清空引用
      context.subscriptions.push(
        vscode.window.onDidCloseTerminal((closedTerminal) => {
          if (closedTerminal === terminal) {
            terminal = null
          }
        }),
      )
    }

    // 本地存在新的提交
    if (!state.HEAD?.upstream || state.HEAD?.ahead !== 0) {
      outputChannel.appendLine('There are new commits locally')

      const command = `git commit --amend ${
        addStagedOrNot ? '' : '-o'
      } -m"$(git log --format=%B -n1)" -m"${config.tag}" ${pushOrNot ? '&& git push' : ''}`
      terminal.sendText(command)
      outputChannel.appendLine('execute: ' + command)
    } else {
      // 本地无新的提交
      outputChannel.appendLine('There are no new commits locally')

      const command = `git commit --allow-empty ${addStagedOrNot ? '' : '-o'} -m"build: ${
        config.tag
      }" ${pushOrNot ? '&& git push' : ''}`
      terminal.sendText(command)
      outputChannel.appendLine('execute: ' + command)
    }

    terminal.show()

    // const lastCommit = await repo.getCommit("HEAD");
    // const commitMessage = `${lastCommit.message}\n\n[build]`;
    // await repo.commit(commitMessage, { amend: true });
    // repo.push()
  })

  context.subscriptions.push(disposable)
}

async function showDialog(
  message: string,
  config: vscode.WorkspaceConfiguration,
  configName: string,
  detail?: string,
) {
  const buttonOptions = [
    { title: 'Yes' },
    { title: 'No' },
    { title: "Don't show again" },
    { title: 'Cancle', isCloseAffordance: true },
  ]
  const messageOptions: vscode.MessageOptions = { modal: true, detail: detail }

  const pick = (await vscode.window.showWarningMessage(
    message,
    messageOptions,
    ...buttonOptions,
  )) || { title: 'Cancle' }

  if (pick?.title === "Don't show again") {
    const buttonOptions = [
      { title: 'Always' },
      { title: 'Never' },
      { title: 'Cancle', isCloseAffordance: true },
    ]
    const messageOptions: vscode.MessageOptions = { modal: true }

    const pick = (await vscode.window.showWarningMessage(
      '请选择默认方式',
      messageOptions,
      ...buttonOptions,
    )) || { title: 'Cancle' }

    if (pick.title === 'Always') {
      config.update(configName, ConfigOptions.Always, true)
      return DialogPick.Yes
    } else if (pick.title === 'Never') {
      config.update(configName, ConfigOptions.Never, true)
      return DialogPick.No
    } else {
      return DialogPick.Cancle
    }
  }

  return DialogPick[pick.title as keyof typeof DialogPick]
}

const getTimeStamp = () => {
  const date = new Date()
  return (
    '[' +
    date.getFullYear() +
    '-' +
    pad2(date.getMonth() + 1) +
    '-' +
    pad2(date.getDate()) +
    ' ' +
    pad2(date.getHours()) +
    ':' +
    pad2(date.getMinutes()) +
    ':' +
    pad2(date.getSeconds()) +
    '.' +
    pad3(date.getMilliseconds()) +
    '] '
  )
}

/**
 * Pad a number with a leading zero if it is less than two digits long.
 * @param n The number to be padded.
 * @returns The padded number.
 */
function pad2(n: number) {
  return (n > 9 ? '' : '0') + n
}

/**
 * Pad a number with leading zeros if it is less than three digits long.
 * @param n The number to be padded.
 * @returns The padded number.
 */
function pad3(n: number) {
  return (n > 99 ? '' : n > 9 ? '0' : '00') + n
}
