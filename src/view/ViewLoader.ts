import path = require("path");
import * as vscode from "vscode";
import * as fs from "fs";

/**
 * Sets up webview content
 * Allows exchange between the extension and react app
 */

export default class ViewLoader {
  private readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionPath: string;

  constructor(jsonTxt: string, extensionPath: string, uri: vscode.Uri, cmd: string) {
    this._extensionPath = extensionPath;
    this._panel = vscode.window.createWebviewPanel(
      "jsonEditor",
      "JSON Editor",
      vscode.ViewColumn.One,
      {
        enableScripts: true,

        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "configViewer"))
        ]
      }
    );

    this._panel.webview.html = this.getWebviewContent(jsonTxt, cmd);

    // Saves updated file state from react app to json file
    this._panel.webview.onDidReceiveMessage(
      (config: any) => {
        this.saveFileContent(uri, config);
        return;
      },
    );

  }

  /**
   * Updates the json file with changes from webview
   * @param fileUri file which the command was given
   * @param jsonTxt json object that has been updated from react app to override past file contents
   */
  private saveFileContent(fileUri: vscode.Uri, jsonTxt: any){
    let txt = JSON.stringify(jsonTxt);
    fs.writeFileSync(fileUri.fsPath, txt);

    vscode.window.showInformationMessage("Configuration Saved");
  }

  /**
   * Sets up the view html
   * passes infromation to react app with window.initialData
   * @param jsonTxt text from the file
   * @param command which command was issued, to edit mission, create new mission, or view plain json
   * @returns 
   */
  private getWebviewContent(jsonTxt: string, command: string): string {
    // get the compiled react app to be loaded into this html
    const reactAppUri = this._panel?.webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionPath, 'configViewer', 'configViewer.js')));
    let initialData = {"jsontTxt": jsonTxt, "command": command};
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>

        <script>
          window.acquireVsCodeApi = acquireVsCodeApi;
          window.initialData = ${JSON.stringify(initialData)};
        </script>
    </head>
    <body>
        <div id="root"></div>
        
        <script src="${reactAppUri}"></script>
    </body>
    </html>`;
  }

}