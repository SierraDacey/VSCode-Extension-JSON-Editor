// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ViewLoader from './view/ViewLoader';

/**
 * Extension Entry Point
 * Mapping commands to viewloads 
 */

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// edit a pre existing json file used as a mission configuration
	let disposableEditMission = vscode.commands.registerCommand('jsonEditor.editMission', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
		  return; // No open text editor
		}
		const view = new ViewLoader(editor.document.getText(), context.extensionPath, editor.document.uri, "edit");
	});

	// create a blank template to start a mission configuration file
	let disposableNewMission = vscode.commands.registerCommand('jsonEditor.newMission', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
		  return; // No open text editor
		}
		const view = new ViewLoader(editor.document.getText(), context.extensionPath, editor.document.uri, "new");
	});

	// plain json viewer with not templates applied
	let disposablePlainJSON = vscode.commands.registerCommand('jsonEditor.viewJSON', () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
		  return; // No open text editor
		}
		const view = new ViewLoader(editor.document.getText(), context.extensionPath, editor.document.uri, "view");
	});

	context.subscriptions.push(disposableEditMission);
	context.subscriptions.push(disposableNewMission);
	context.subscriptions.push(disposablePlainJSON);
}

// This method is called when your extension is deactivated
export function deactivate() {}
