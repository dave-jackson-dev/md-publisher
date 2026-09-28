import * as path from 'node:path';
import * as vscode from 'vscode';
import {
    ALL_BUILD_TARGETS,
    collectStructureViolations,
    compilePublication,
    ensureOutputDirIgnored,
    generatePublication,
    loadPublication,
    type BuildTarget
} from 'md-publisher-publishing';

export function registerCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('md-publisher.openAsMdpub', openAsMdpub),
        vscode.commands.registerCommand('md-publisher.publish', publishFolder)
    );
}

/**
 * "Open an .md file with our editor": a file-picker rather than relying on automatic
 * extension-based association, since `.md` is also claimed by VS Code's built-in Markdown
 * support — explicitly setting the language mode after opening sidesteps that ambiguity instead
 * of fighting over the default editor for the extension.
 */
async function openAsMdpub(): Promise<void> {
    const uris = await vscode.window.showOpenDialog({
        canSelectMany: false,
        canSelectFiles: true,
        canSelectFolders: false,
        openLabel: 'Open with md-publisher',
        filters: { 'md-publisher / Markdown': ['mdpub', 'md'] }
    });
    if (!uris || uris.length === 0) {
        return;
    }
    const document = await vscode.workspace.openTextDocument(uris[0]);
    await vscode.languages.setTextDocumentLanguage(document, 'md-publisher');
    await vscode.window.showTextDocument(document);
}

interface TargetPick extends vscode.QuickPickItem {
    targets: readonly BuildTarget[];
}

const TARGET_PICKS: TargetPick[] = [
    { label: 'All', description: ALL_BUILD_TARGETS.join(', '), targets: ALL_BUILD_TARGETS },
    { label: 'DOCX', targets: ['docx'] },
    { label: 'PDF', targets: ['pdf'] },
    { label: 'Web', targets: ['web'] },
    { label: 'EPUB', targets: ['epub'] }
];

/**
 * "Publish a folder": right-click a folder in the Explorer only (excluded from the Command
 * Palette in package.json) — `uri` is always supplied by VS Code in that case, so there's no
 * folder-picker fallback path to build or maintain here.
 */
async function publishFolder(uri: vscode.Uri | undefined): Promise<void> {
    if (!uri) {
        vscode.window.showErrorMessage('md-publisher: Publish must be run by right-clicking a folder in the Explorer.');
        return;
    }

    const pick = await vscode.window.showQuickPick(TARGET_PICKS, {
        placeHolder: 'Choose a Build Target to generate'
    });
    if (!pick) {
        return;
    }

    await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'md-publisher: Publishing…', cancellable: false },
        () => runPublish(uri.fsPath, pick.targets)
    );
}

async function runPublish(publicationDir: string, targets: readonly BuildTarget[]): Promise<void> {
    try {
        const publication = await loadPublication(publicationDir);
        const violations = collectStructureViolations(publication);

        // BR-5: a refused Generation produces no Output Artifact at all — the same rule the CLI's
        // `generate` command follows (packages/cli/src/main.ts), kept identical here rather than
        // reimplemented, since both call straight into packages/publishing.
        if (violations.length > 0) {
            const summary = violations
                .map(({ sourcePath, diagnostic }) => `${path.basename(sourcePath)}: ${diagnostic.message}`)
                .join('\n');
            vscode.window.showErrorMessage(
                `md-publisher: Structure Violation — no Output Artifact was produced.\n${summary}`,
                { modal: true }
            );
            return;
        }

        const compiled = compilePublication(publication);
        const outDir = path.join(publicationDir, 'dist');
        await ensureOutputDirIgnored(publicationDir, 'dist');
        const outcomes = await generatePublication(compiled, [...targets], outDir);

        const generated = outcomes.filter(outcome => outcome.outcome === 'generated');
        const failed = outcomes.filter(outcome => outcome.outcome === 'build-target-violation');

        if (generated.length > 0) {
            const names = generated.map(outcome => outcome.target.toUpperCase()).join(', ');
            vscode.window.showInformationMessage(`md-publisher: generated ${names} into ${path.relative(publicationDir, outDir) || 'dist'}/`);
        }
        if (failed.length > 0) {
            const summary = failed.map(outcome => `${outcome.target.toUpperCase()}: ${outcome.message}`).join('\n');
            vscode.window.showWarningMessage(`md-publisher: some targets were skipped.\n${summary}`, { modal: false });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`md-publisher: ${error instanceof Error ? error.message : String(error)}`);
    }
}
