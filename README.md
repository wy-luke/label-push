# Tag Push extension for Visual Studio Code

**Tag Push** could add some specific words, as a tag, to your latest commit's message and then push.

## Features

- Add a tag to the latest commit's message and then push.
- Create an empty commit with the tag when there are no new commits locally.
- Set the tag words in extension settings.
- Pull automatically when necessary.
- Select whether to keep the changes staged.
- Select whether to publish the branch that does not exist in the remote repository.
- Select whether to publish the branch that was deleted in the remote repository.

## Extension Settings

- Tag: The string added to the commit message, aka the tag.

  - type: string,
  - default: [build]

- PublishBranch: Whether to publish the branch that does not exist in the remote repository.

  - type: string
  - enum: [Always, Never, Suggest]
  - default: Suggest

- AddStaged: Whether to add the changes staged.
  - type: string
  - enum: [Always, Never, Suggest]
  - default: Suggest

## Release Notes

Detailed Release Notes are available [here](CHANGELOG.md).
