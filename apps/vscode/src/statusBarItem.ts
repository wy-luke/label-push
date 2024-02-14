import * as vscode from 'vscode'
import { Logger } from './logger'
import { API as gitAPI, Repository } from './git'

/**
 * Manages the Tag Push Status Bar Item, which allows users to use Tag Push from the Visual Studio Code Status Bar.
 */
export class StatusBarItem {
  private readonly config: vscode.WorkspaceConfiguration
  private readonly logger: Logger
  private readonly statusBarItem: vscode.StatusBarItem

  private isVisible: boolean = false
  private numRepos: number = 0

  /**
   * Creates the Tag Push Status Bar Item.
   */
  constructor(config: vscode.WorkspaceConfiguration, logger: Logger, git: gitAPI) {
    this.config = config
    this.logger = logger

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1)
    statusBarItem.text = 'Tag Push'
    statusBarItem.tooltip = 'Tag Push'
    statusBarItem.command = 'tag-push.tagPush'
    this.statusBarItem = statusBarItem

    this.setNumRepos(git.repositories.length)

    git.onDidOpenRepository(() => {
      this.setNumRepos(git.repositories.length)
    })

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('tag-push.showStatusBarItem')) {
        this.refresh()
      }
    })
  }

  /**
   * Sets the number of repositories known to Git Graph, before refreshing the Status Bar Item.
   * @param numRepos The number of repositories known to Git Graph.
   */
  private setNumRepos(numRepos: number) {
    this.numRepos = numRepos
    this.refresh()
  }

  /**
   * Show or hide the Status Bar Item according to the configured value of `tag-push.showStatusBarItem`.
   */
  private refresh() {
    const shouldBeVisible = this.config.showStatusBarItem && this.numRepos > 0
    if (this.isVisible !== shouldBeVisible) {
      if (shouldBeVisible) {
        this.statusBarItem.show()
        this.logger.log('Showing "Tag Push" status bar item')
      } else {
        this.statusBarItem.hide()
        this.logger.log('Hiding "Tag Push" status bar item')
      }
      this.isVisible = shouldBeVisible
    }
  }
}
