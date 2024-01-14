import { LogType } from './types'
import * as vscode from 'vscode'

/**
 * Manages the Tag Push Logger, which writes log information to the Tag Push Output Channel.
 */
export class Logger {
  private readonly channel: vscode.OutputChannel

  /**
   * Creates the Tag Push Logger.
   */
  constructor() {
    this.channel = vscode.window.createOutputChannel('Tag Push')
  }

  /**
   * Log a message to the Output Channel.
   * @param log The string to be logged.
   * @param logType Type of the log: Info, Warn, Error.
   */
  public log(log: string, logType = LogType.Info) {
    this.channel.appendLine(`[${getTimeStamp()}] [${logType}] > ${log}`)
  }

  public show() {
    this.channel.show()
  }
}

/**
 * Get the current timestamp in the format 'YYYY-MM-DD HH:mm:ss.SSS'.
 */
function getTimeStamp() {
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
