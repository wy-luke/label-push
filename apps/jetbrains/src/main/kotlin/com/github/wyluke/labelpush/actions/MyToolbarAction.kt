package com.github.wyluke.labelpush.actions

import com.intellij.notification.Notification
import com.intellij.notification.NotificationType
import com.intellij.notification.Notifications
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.diagnostic.thisLogger
import com.intellij.openapi.project.DumbAware


class MyToolbarAction : AnAction(), DumbAware {
    override fun actionPerformed(e: AnActionEvent) {
        // Handle button click here
        thisLogger().info("Button clicked")

        // create a notification
        Notifications.Bus.notify(
            Notification(
                "Label Push Notifications",
                "Label Push Notification",
                "Button clicked",
                NotificationType.WARNING
            )
        )
    }
}
