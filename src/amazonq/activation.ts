/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtensionContext, window } from 'vscode'
import { AmazonQChatViewProvider } from './webview/webView'
import { init as cwChatAppInit } from '../codewhispererChat/app'
import { init as weaverbirdChatAppInit } from '../weaverbird/app'
import { AmazonQAppInitContext, DefaultAmazonQAppInitContext } from './apps/initContext'
import { weaverbirdEnabled } from '../weaverbird/config'
import { Commands } from '../shared/vscode/commands2'
import { MessagePublisher } from './messages/messagePublisher'
import { welcome } from './onboardingPage'
import { learnMoreAmazonQCommand, runQTransformCommand, switchToAmazonQCommand } from './explorer/amazonQChildrenNodes'

export async function activate(context: ExtensionContext) {
    const appInitContext = new DefaultAmazonQAppInitContext()

    registerApps(appInitContext)

    const provider = new AmazonQChatViewProvider(
        context,
        appInitContext.getWebViewToAppsMessagePublishers(),
        appInitContext.getAppsToWebViewMessageListener(),
        appInitContext.onDidChangeAmazonQVisibility
    )

    const cwcWebViewToAppsPublisher = appInitContext.getWebViewToAppsMessagePublishers().get('cwc')!

    context.subscriptions.push(
        window.registerWebviewViewProvider(AmazonQChatViewProvider.viewType, provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        })
    )

    amazonQWelcomeCommand.register(context, cwcWebViewToAppsPublisher)
    learnMoreAmazonQCommand.register()
    switchToAmazonQCommand.register()
    runQTransformCommand.register()
}

function registerApps(appInitContext: AmazonQAppInitContext) {
    cwChatAppInit(appInitContext)
    if (weaverbirdEnabled) {
        weaverbirdChatAppInit(appInitContext)
    }
}

export const amazonQWelcomeCommand = Commands.declare(
    'aws.amazonq.welcome',
    (context: ExtensionContext, publisher: MessagePublisher<any>) => () => {
        welcome(context, publisher)
    }
)
