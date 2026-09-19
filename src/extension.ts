import * as vscode from "vscode";

const initializeLocalThemeSetting = "colored-theme.initializeLocalTheme";

export function activate(context: vscode.ExtensionContext): void {
    const initializeFolder = async (folder: vscode.WorkspaceFolder): Promise<void> => {
        if (!vscode.workspace.getConfiguration().get<boolean>(initializeLocalThemeSetting, true)) {
            return;
        }

        const workbenchConfiguration = vscode.workspace.getConfiguration("workbench", folder.uri);
        const colorTheme = workbenchConfiguration.inspect<string>("colorTheme");
        const isMultiRootWorkspace = vscode.workspace.workspaceFile !== undefined;
        const hasLocalValue = isMultiRootWorkspace
            ? colorTheme?.workspaceFolderValue !== undefined
            : colorTheme?.workspaceValue !== undefined;

        if (hasLocalValue) {
            return;
        }

        const globalTheme = colorTheme?.globalValue ?? colorTheme?.defaultValue;

        if (globalTheme === undefined) {
            return;
        }

        try {
            await workbenchConfiguration.update(
                "colorTheme",
                globalTheme,
                isMultiRootWorkspace
                    ? vscode.ConfigurationTarget.WorkspaceFolder
                    : vscode.ConfigurationTarget.Workspace
            );
        } catch (error) {
            console.warn(`Colored Theme: impossible d'initialiser ${folder.uri.fsPath}`, error);
        }
    };

    const initializeFolders = (folders: readonly vscode.WorkspaceFolder[]): void => {
        void Promise.all(folders.map(initializeFolder));
    };

    initializeFolders(vscode.workspace.workspaceFolders ?? []);
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders((event) => initializeFolders(event.added))
    );
}
