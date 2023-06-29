import * as React from 'react';
import * as ReactDOM from 'react-dom';
import JSONEditor from './editor';

/**
 * Initial point for react app
 * takes information passed from window.initialData from extension to be used in app
 */

declare global{
    interface Window {
        acquireVsCodeApi(): any;
        initialData: any;
    }
}

const vscode = window.acquireVsCodeApi();

ReactDOM.render(
    <JSONEditor vscode={vscode} initialData={window.initialData.jsontTxt === '' ? {} : JSON.parse(window.initialData.jsontTxt)} cmd={window.initialData.command} />,
    document.getElementById('root')
);


