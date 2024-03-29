import * as vscode from 'vscode'
import { GitErrorCodes, GitExtension, Repository } from './git'
import { ConfigOptions, DialogPick, LogType } from './types'
import { Logger } from './logger'
import { StatusBarItem } from './statusBarItem'

/**
 * This method is called when the extension is activated by any activationEvents in package.json.
 * If there are no activationEvents listed，get called when the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
  const logger = new Logger()

  logger.log('Starting Label Push......')

  // 获取当前项目的根路径
  const workspaceRoot = vscode.workspace.workspaceFolders
  if (!workspaceRoot) {
    logger.log('No workspace folder opened', LogType.Error)
    return
  }

  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
  const git = gitExtension?.getAPI(1)
  if (!git) {
    vscode.window.showErrorMessage('没有找到Git插件，请检查是否禁用。')
    logger.log('The git extension not found', LogType.Error)
    return
  }

  let currentRepo: Repository | null = null

  const setRepo = (repo: Repository) => {
    logger.log(`${git.repositories.length.toString()} repositories detected`)

    if (git.repositories.length === 1) {
      currentRepo = repo
      logger.log(`Set git repository: ${currentRepo.rootUri}`)
    } else {
      vscode.window.showErrorMessage('暂不支持同时打开多个Git仓库')
      logger.log(`${git.repositories.length.toString()} repositories detected`, LogType.Error)
    }
  }

  if (git.repositories.length >= 1) {
    setRepo(git.repositories[0])
  } else {
    context.subscriptions.push(
      git.onDidOpenRepository((repo) => {
        setRepo(repo)
      }),
    )
  }

  logger.log('Reading configurations......')
  let config = vscode.workspace.getConfiguration('label-push')
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('label-push')) {
      logger.log('Configurations was changed......')
      config = vscode.workspace.getConfiguration('label-push')
    }
  })

  new StatusBarItem(config, logger, git)

  let terminal: vscode.Terminal | null = null

  // 注册命令
  let disposable = vscode.commands.registerCommand('label-push.labelPush', async () => {
    if (!currentRepo) {
      vscode.window.showErrorMessage('没有找到Git仓库，请检查当前目录。')
      logger.log('No git repository was detected', LogType.Error)
      return
    }

    let pushOrNot = true
    let addStagedOrNot = false
    let command: string = ''

    const state = currentRepo.state

    // 无远程仓库
    if (state.remotes.length === 0) {
      vscode.window.showErrorMessage('未设置远程仓库')
      logger.log('Remote repository not found', LogType.Error)
      return
    }

    // prune 操作过于危险，先注掉
    // await currentRepo.fetch({ prune: true })

    try {
      logger.log(`Start to fetch......`)
      await currentRepo.fetch()
      logger.log('Fetch successfully')
    } catch (error) {
      logger.log(`Fetch failed: ${error}`, LogType.Error)
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

    // 工作区存在修改
    // if (state.workingTreeChanges.length !== 0) {
    //   addWorkingTree = await showDialog(
    //     '当前暂存区无修改，工作区存在修改，是否直接提交？',
    //     config,
    //     'addWorkingTree',
    //   )
    // }

    // 远程分支存在新的提交，需要拉取
    if (state.HEAD?.behind !== 0) {
      try {
        logger.log(`Start to pull......`)
        await currentRepo.pull()
        logger.log(`Pull successfully`)
      } catch (error) {
        const erroCode = (error as any).gitErrorCode
        if (erroCode === GitErrorCodes.Conflict || erroCode === GitErrorCodes.StashConflict) {
          vscode.window.showErrorMessage('存在冲突，请解决后再次提交')
          logger.log(`Pull resulted in conflicts`, LogType.Error)
        } else {
          logger.log(`Pull failed: ${error}`, LogType.Error)

          const pick = await vscode.window.showErrorMessage('拉取失败，请检查', '查看日志')
          if (pick === '查看日志') {
            logger.show()
          }
        }
        return
      }
    }

    if (!terminal) {
      // 如果不存在，创建新终端
      terminal = vscode.window.createTerminal({
        name: `Label Push`,
        cwd: workspaceRoot[0].uri.fsPath,
        hideFromUser: true,
      })
      logger.log(`Create a terminal`)

      // 注册关闭事件，当终端被关闭时清空引用
      context.subscriptions.push(
        vscode.window.onDidCloseTerminal((closedTerminal) => {
          if (closedTerminal === terminal) {
            terminal = null
            logger.log(`Close the terminal`)
          }
        }),
      )
    }

    // 暂存区存在修改
    if (state.indexChanges.length !== 0) {
      if (config.addStaged === ConfigOptions.Suggest) {
        const pick = await showDialog(
          '当前暂存区存在修改，是否添加到最新一次提交？',
          config,
          'addStaged',
        )
        if (pick === DialogPick.Cancle) {
          return
        }
        addStagedOrNot = pick === DialogPick.Yes
      } else if (config.addStaged === ConfigOptions.Always) {
        addStagedOrNot = true
      } else if (config.addStaged === ConfigOptions.Never) {
        logger.log(`Adding staged files is disabled`)
      }
    }

    // 本地存在新的提交
    if (!state.HEAD?.upstream || state.HEAD?.ahead !== 0) {
      logger.log('There are new commits locally')

      // 上一个提交已经包含label，不做操作
      // if (state.HEAD?.commit) {
      //   const lastMessage = (await currentRepo.getCommit(state.HEAD.commit)).message
      //   if (lastMessage.includes(config.label)) {
      //     logger.log(`Last commit message has included label: ${lastMessage}`)
      //     return
      //   }
      // }

      // 上一个提交为empty时，不加--allow-empty无法进行修改
      command = `git commit --allow-empty --amend ${
        addStagedOrNot ? '' : '-o'
      } -m"$(git log --format=%B -n1)" -m"${config.label}" ${pushOrNot ? '&& git push' : ''}`
    } else {
      // 本地无新的提交
      logger.log('There are no new commits locally')

      let commitEmpty = false
      if (config.commitEmpty === ConfigOptions.Suggest) {
        const pick = await showDialog(
          '本地没有新的提交，是否创建空提交(Empty Commit)?',
          config,
          'commitEmpty',
        )
        if (pick === DialogPick.Cancle) {
          return
        }
        commitEmpty = pick === DialogPick.Yes
      } else if (config.commitEmpty === ConfigOptions.Always) {
        commitEmpty = true
      } else if (config.commitEmpty === ConfigOptions.Never) {
        logger.log(`Creating empty commit is disabled`)
      }

      if (!commitEmpty) {
        logger.log(`Don't create empty commit`)
        return
      }

      // 工作区存在修改

      command = `git commit --allow-empty ${addStagedOrNot ? '' : '-o'} -m"build: ${
        config.label
      }" ${pushOrNot ? '&& git push' : ''}`
    }

    logger.log('Execute: ' + command)
    terminal.sendText(command)

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

// This method is called when your extension is deactivated
export function deactivate() {}
