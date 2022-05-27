/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode'
import { Window } from '../shared/vscode/window'
import * as localizedText from '../shared/localizedText'

import * as nls from 'vscode-nls'
import { CawsOrg, CawsProject, CawsRepo, getCawsConfig } from '../shared/clients/cawsClient'
import { Commands } from '../shared/vscode/commands'
import { pushIf } from '../shared/utilities/collectionUtils'
const localize = nls.loadMessageBundle()

export async function promptCawsNotConnected(window = Window.vscode(), commands = Commands.vscode()): Promise<void> {
    const connect = localize('AWS.command.caws.connect', 'Connect to CODE.AWS')
    return await window
        .showWarningMessage(
            localize('AWS.caws.badConnection', 'Not connected to CODE.AWS.'),
            connect,
            localizedText.viewDocs
        )
        .then(btn => {
            if (btn === connect) {
                commands.execute('aws.caws.connect')
            } else if (btn === localizedText.viewDocs) {
                vscode.env.openExternal(vscode.Uri.parse(getHelpUrl()))
            }
        })
}

/**
 * Builds a web URL from the given CAWS object.
 */
export function toCawsUrl(resource: CawsOrg | CawsProject | CawsRepo) {
    const prefix = `https://${getCawsConfig().hostname}/organizations`

    const format = (org: string, proj?: string, repo?: string) => {
        const parts = [prefix, org]
        pushIf(parts, !!proj, 'projects', proj)
        pushIf(parts, !!repo, 'source-repositories', repo)

        return parts.concat('view').join('/')
    }

    switch (resource.type) {
        case 'org':
            return format(resource.name)
        case 'project':
            return format(resource.org.name, resource.name)
        case 'repo':
            return format(resource.org.name, resource.project.name, resource.name)
    }
}

export function getHelpUrl(): string {
    return `https://${getCawsConfig().hostname}/help`
}

/**
 * Builds a web URL from the given CAWS object.
 */
export function openCawsUrl(o: CawsOrg | CawsProject | CawsRepo) {
    const url = toCawsUrl(o)
    vscode.env.openExternal(vscode.Uri.parse(url))
}