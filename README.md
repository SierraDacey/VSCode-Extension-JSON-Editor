# README

## Features
*Demo available at https://youtu.be/LdTG7CjZEJU*

This extension offers 3 commands:
- JSON Editor: Plain JSON Viewer
    -  From a json file, will show UI webview of the json object and allow for edits
- JSON Editor: Edit Mission
    - From a json file, will compare the json object to a json schema. This schema lists the requirements that the json file must follow. This includes:
        - type checking fields
        - checking existance of required fields
        - not allowing extra fields not specified in schema
    - This is currently used for an example of checking configuration files for missions to follow a specific format and this format will not be broken with changes.
- JSON Editor: New Mission
    - Creates a blank json object with default values for required fields of the defined schema. 
    - This is currently used as an example for starting from scratch when creating a new mission configuration file ensuring that is follows all needed guidlines.


## To Run

To run locally, 
- In file folder run `npm install` then `npm run compile`
- In vscode use the `f5` command to open the Extension Development Host
- With a json file opened in Extension Development Host, use the command `ctrl+shift+p` to open the prompt
- Issue either 'JSON Editor: Plain JSON Viewer', 'JSON Editor: Plain JSON Viewer', or 'JSON Editor: Plain JSON Viewer'

Here is a sample mission json:
`{"name":"mission 3","description":"this is a test mission","id":0,"test":true,"mission":"subsurface","robot":{"name":"Robot Name 1","actuatorList":["fr","fl","br","bl"]}}`

## Extension Settings

The schema to enforce mission requirements is in `src/view/app/model.ts`. This can be updated to fit any addition or different requirements. 


## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)



**Enjoy!**
