import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('Register the tagPush command', () => {
    vscode.commands.getCommands().then((commands) => {
      assert.ok(commands.includes('tag-push.tagPush'))
    })
  })

  test('Check the default value of configs', () => {
    const config = vscode.workspace.getConfiguration('tag-push')
    assert.strictEqual(config.get('tag'), '[build]')
    assert.strictEqual(config.get('commitEmpty'), false)
    assert.strictEqual(config.get('showStatusBarItem'), true)
    assert.strictEqual(config.get('publishBranch'), 'Suggest')
    assert.strictEqual(config.get('publishDeletedBranch'), 'Suggest')
    assert.strictEqual(config.get('addStaged'), 'Suggest')
  })
})
