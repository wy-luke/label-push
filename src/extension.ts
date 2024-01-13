import * as vscode from 'vscode'
import { GitErrorCodes, GitExtension, Repository } from './git'
import { ConfigOptions, DialogPick, LogType } from './types'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('Tag Push')
  const log = (log: String, logType = LogType.Info) => {
    outputChannel.appendLine(`[${getTimeStamp()}] [${logType}] ${log}`)
  }

  log('Starting Tag Push......')

  // 获取当前项目的根路径
  const workspaceRoot = vscode.workspace.workspaceFolders
  if (!workspaceRoot) {
    log('No workspace folder opened', LogType.Error)
    return
  }

  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
  const git = gitExtension?.getAPI(1)
  if (!git) {
    vscode.window.showErrorMessage('没有找到Git插件，请检查是否禁用。')
    log('The git extension not found', LogType.Error)
    outputChannel.show()
    return
  }

  log(`${git.repositories.length.toString()} repositories detected`)

  let currentRepo: Repository | null = null
  if (git.repositories.length > 0) {
    currentRepo = git.repositories[0]
    log(`Set git repository: ${git.repositories[0].rootUri}`)
  } else {
    git.onDidOpenRepository((repo) => {
      currentRepo = repo
      log(`${git.repositories.length.toString()} repositories detected`)
      log(`Set git repository: ${repo.rootUri}`)
      log('Start successfully')
    })
  }

  let config = vscode.workspace.getConfiguration('tag-push')
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('tag-push')) {
      config = vscode.workspace.getConfiguration('tag-push')
    }
  })

  if (currentRepo) {
    log('Start successfully')
  }

  let terminal: vscode.Terminal | null = null

  let disposable = vscode.commands.registerCommand('tag-push.tagPush', async () => {
    if (!currentRepo) {
      vscode.window.showErrorMessage('没有找到Git仓库，请检查当前目录。')
      log('No git repository was detected', LogType.Error)
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

    // prune 操作过于危险，先注掉
    // await currentRepo.fetch({ prune: true })

    try {
      await currentRepo.fetch()
      log('Fetch successfully')
    } catch (error) {
      log(`Fetch failed: ${error}`, LogType.Error)
    }

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
    } else if (!state.HEAD?.upstream?.commit) {
      // 远程分支被删除
      if (config.publishDeletedBranch === ConfigOptions.Suggest) {
        const pick = await showDialog(
          '远程分支疑似被删除，是否直接推送？',
          config,
          'publishDeletedBranch',
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
        log(`Start to pull......`)
        await currentRepo.pull()
        log(`Pull successfully`)
      } catch (error) {
        const erroCode = (error as any).gitErrorCode
        if (erroCode === GitErrorCodes.Conflict || erroCode === GitErrorCodes.StashConflict) {
          vscode.window.showInformationMessage('存在冲突，请解决后再次提交')
          log(`Pull resulted in conflicts`, LogType.Error)
        } else {
          log(`Pull failed: ${error}`, LogType.Error)
          outputChannel.show()
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
      log(`Create a terminal`)

      // 注册关闭事件，当终端被关闭时清空引用
      context.subscriptions.push(
        vscode.window.onDidCloseTerminal((closedTerminal) => {
          if (closedTerminal === terminal) {
            terminal = null
            log(`Close the terminal`)
          }
        }),
      )
    }

    let command: string = ''
    // 本地存在新的提交
    if (!state.HEAD?.upstream || state.HEAD?.ahead !== 0) {
      log('There are new commits locally')

      command = `git commit --amend ${
        addStagedOrNot ? '' : '-o'
      } -m"$(git log --format=%B -n1)" -m"${config.tag}" ${pushOrNot ? '&& git push' : ''}`
    } else {
      // 本地无新的提交
      outputChannel.appendLine('There are no new commits locally')

      command = `git commit --allow-empty ${addStagedOrNot ? '' : '-o'} -m"build: ${config.tag}" ${
        pushOrNot ? '&& git push' : ''
      }`
    }
    terminal.sendText(command)
    log('Execute: ' + command)

    // terminal.show()

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
    pad3(date.getMilliseconds())
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
