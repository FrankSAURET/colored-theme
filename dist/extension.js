"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const initializeLocalThemeSetting = "colored-theme.initializeLocalTheme";
function activate(context) {
    var _a;
    const initializeFolder = async (folder) => {
        var _a;
        if (!vscode.workspace.getConfiguration().get(initializeLocalThemeSetting, true)) {
            return;
        }
        const workbenchConfiguration = vscode.workspace.getConfiguration("workbench", folder.uri);
        const colorTheme = workbenchConfiguration.inspect("colorTheme");
        if ((colorTheme === null || colorTheme === void 0 ? void 0 : colorTheme.workspaceFolderValue) !== undefined) {
            return;
        }
        const globalTheme = (_a = colorTheme === null || colorTheme === void 0 ? void 0 : colorTheme.globalValue) !== null && _a !== void 0 ? _a : colorTheme === null || colorTheme === void 0 ? void 0 : colorTheme.defaultValue;
        if (globalTheme === undefined) {
            return;
        }
        try {
            await workbenchConfiguration.update("colorTheme", globalTheme, vscode.ConfigurationTarget.WorkspaceFolder);
        }
        catch (error) {
            console.warn(`Colored Theme: impossible d'initialiser ${folder.uri.fsPath}`, error);
        }
    };
    const initializeFolders = (folders) => {
        void Promise.all(folders.map(initializeFolder));
    };
    initializeFolders((_a = vscode.workspace.workspaceFolders) !== null && _a !== void 0 ? _a : []);
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders((event) => initializeFolders(event.added)));
}
//# sourceMappingURL=extension.js.map