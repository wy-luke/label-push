import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Register the labelPush command', () => {
    vscode.commands.getCommands().then((commands) => {
      assert.ok(commands.includes('label-push.labelPush'))
    })
  })

  test('Check the default value of configs', () => {
    const config = vscode.workspace.getConfiguration('label-push')
    assert.strictEqual(config.get('label'), '[build]')
    assert.strictEqual(config.get('showStatusBarItem'), true)
    assert.strictEqual(config.get('commitEmpty'), 'Suggest')
    assert.strictEqual(config.get('publishBranch'), 'Suggest')
    assert.strictEqual(config.get('publishDeletedBranch'), 'Suggest')
    assert.strictEqual(config.get('addStaged'), 'Suggest')
  })
})
