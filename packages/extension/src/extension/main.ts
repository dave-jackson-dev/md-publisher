import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClient, State, TransportKind } from 'vscode-languageclient/node.js';
import { registerCommands } from './commands.js';

let client: LanguageClient;
let disconnectedStatusBarItem: vscode.StatusBarItem;

// This function is called when the extension is activated.
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    disconnectedStatusBarItem = createDisconnectedStatusBarItem();
    context.subscriptions.push(disconnectedStatusBarItem);
    registerCommands(context);
    client = await startLanguageClient(context);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

/**
 * Feature 8 Scenario 3: when the language server connection is lost, the Editor must show an
 * explicit "validation unavailable" state — never silently present a stale or absent Diagnostic
 * as if the Document were valid. `State.Stopped` fires both on an actual disconnect and before
 * the very first start; showing the banner in both cases is the conservative, correct choice
 * (diagnostics genuinely aren't available yet either way) rather than trying to distinguish them.
 */
function createDisconnectedStatusBarItem(): vscode.StatusBarItem {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    item.text = '$(warning) Validation unavailable';
    item.tooltip = 'md-publisher: language server disconnected. Diagnostics are stale or absent — not shown as if the Document were valid.';
    item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    return item;
}

async function startLanguageClient(context: vscode.ExtensionContext): Promise<LanguageClient> {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: '*', language: 'md-publisher' }]
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'md-publisher',
        'MD Publisher',
        serverOptions,
        clientOptions
    );

    client.onDidChangeState(event => {
        if (event.newState === State.Stopped) {
            disconnectedStatusBarItem.show();
        } else if (event.newState === State.Running) {
            disconnectedStatusBarItem.hide();
        }
    });

    // Start the client. This will also launch the server
    await client.start();
    return client;
}
