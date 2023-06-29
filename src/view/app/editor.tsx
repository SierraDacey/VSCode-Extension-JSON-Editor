import * as React from "react";
import './editor.css';

// MUI imports
import TextField from '@mui/material/TextField';
import { Button, ThemeProvider, createTheme } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { Checkbox } from "@mui/material";

// Helper imports
// allows for easy validation between JSONSchema and JSON
// reference https://ajv.js.org/guide/typescript.html
import Ajv, { JSONSchemaType } from "ajv";
const ajv = new Ajv();
// allows deep properties to be accessed off of opbject from string path
import { set } from 'lodash';

import { blankMission, missionSchema } from "./mission";

interface Props{
    vscode: any;
    initialData: any;
    cmd: string
}

interface State{
    config: any; // current json value
    cmd: string; // current action taking place (edit mission, new mission, view plain json)
}

// Validation to use against mission json requirements
const validate = ajv.compile(missionSchema);

// Color theme to implement with react to follow JPL colors 
const theme = createTheme({
    palette:{
        primary: {
            main: '#fc3d21'
        }
    }
});

export default class JSONEditor extends React.Component<
    Props,
    State
    > {
    constructor(props: any){
        super(props);

        let initialData = this.props.initialData;
        let command = this.props.cmd;

        let oldState = this.props.vscode.getState();
        if (oldState) {
            this.state = oldState;
        } else {
            this.state = { config: initialData, cmd: command};
        }
    }

    /**
     * 
     * Update Methods
     * 
     */
 
    /**
     * Updates state json
     * @param newState 
     */
    private defineState(newState: State){
        this.setState(newState);
        this.props.vscode.setState(newState);
    }

    /**
     * Saves the current configuration to original file
     */
    saveJSON(){
        this.props.vscode.postMessage(this.state.config);
    }

    /**
     * Creates json skeleton with blank or null fields to start out with
     * then switches to edit mission view to input into blank fields
     */
    createNewMission(){
        this.defineState({config:blankMission, cmd:"edit"});
        this.saveJSON();
    }

    /**
     * Updates the value of the json based on changes made in ui view
     * @param value new value to insert
     * @param path path to get to field (allows for array and object nesting) to update
     */
    updateConfig(value: any, path:string){
        let temp = this.state.config; 
        set(temp, path, value);
        this.defineState({config:temp, cmd:this.state.cmd});
    }


    /**
     * 
     * HTML Views for each potential type
     * 
     */
       
    /**
     * Initial JSON Object to display
     * @param json 
     * @param path 
     * @returns 
     */
    jsonObject(json: any, path: string){
        return (
            <div className="obj">
                {/* iterate through each object and render based on that properties type */}
                {/* gets type from mission schema set */}
                {Object.entries(json).map((property) => 
                    <div>{missionSchema.properties[property[0]].type === "string" && missionSchema.properties[property[0]].hasOwnProperty("enum") ? this.jsonEnum(property[1] as string, property[0], missionSchema.properties[property[0]].enum, path+property[0]) 
                    : missionSchema.properties[property[0]].type === "number" ? this.jsonNumber(property[1] as number, property[0], path+property[0]) 
                    : missionSchema.properties[property[0]].type === "object" ? this.jsonObj(property[1] as string, property[0], missionSchema.properties[property[0]], path+property[0])
                    : missionSchema.properties[property[0]].type === "array" ? this.jsonArray(property[1] as Array<any>, property[0], missionSchema.properties[property[0]].items.type, missionSchema.properties[property[0]].items.hasOwnProperty("enum"), missionSchema.properties[property[0]], path+property[0])
                    : missionSchema.properties[property[0]].type === "boolean" ? this.jsonBoolean(property[1] as boolean, property[0], path+property[0])
                    : this.jsonString(property[1] as string, property[0], path+property[0])}</div>
                )}
            </div>
        );
    }

    jsonString(value: string, field:string, path: string){
    return (
        <div className="string-field property">
            <p className="field-label">{field}:</p>
            <TextField
                id={"string-" + field+"-"+value}
                variant="standard"
                onChange={event => this.updateConfig(event.target.value, path)}
                defaultValue={value}
                className="input-field"
            />
        </div>
        );
    }

    jsonNumber(value: number, field: string, path: string){
        return (
            <div className="number-field property">
                <p className="field-label">{field}:</p>
                <TextField
                id={"number-"+value+"-"+field}
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                className="input-field"
                variant="standard"
                defaultValue={value as unknown as number}
                onChange={event => this.updateConfig(Number(event.target.value), path)}
                />
            </div>
        );
    }

    jsonObj(value: Object, field: string, schema: JSONSchemaType<any>, path: string){
        
        return(
            <div className="object-field property">
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id={"obj-"+value+"-"+field}
                    >
                    <Typography>{field}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {Object.entries(value).map((property) => 

                        <div>{schema.properties[property[0]].type === "string" && schema.properties[property[0]].hasOwnProperty("enum") ? this.jsonEnum(property[1] as string, property[0], schema.properties[property[0]].enum, path+'.'+property[0]) 
                        : schema.properties[property[0]].type === "number" ? this.jsonNumber(property[1], property[0], path+'.'+property[0]) 
                        : schema.properties[property[0]].type === "object" ? this.jsonObj(property[1], property[0], schema.properties[property[0]], path+'.'+property[0])
                        : schema.properties[property[0]].type === "array" ? this.jsonArray(property[1], property[0], schema.properties[property[0]].items.type, schema.properties[property[0]].items.hasOwnProperty("enum"), schema.properties[property[0]], path+'.'+property[0])
                        : schema.properties[property[0]].type === "boolean" ? this.jsonBoolean(property[1], property[0], path+'.'+property[0])
                        : this.jsonString(property[1] as string, property[0], path+'.'+property[0])}</div>
                        )}
                    </AccordionDetails>
                </Accordion>
            </div>
        );
    }

    jsonArray(value: Array<any>, field: string, type: string, isEnum: boolean, schema: JSONSchemaType<any>, path:string){

        return(
            <div className="array-field property">
                <p className="field-label">{field}: [</p>
                <div>
                    {value.map((arrayItem, ind) => 
                        <div>
                            {type === "string" && isEnum? this.jsonEnum(arrayItem as string, ind.toString(), schema.items.enum, path+"["+ind+"]") : 
                            type === "number" ? this.jsonNumber(arrayItem, ind.toString(), path+"["+ind+"]"):
                            type === "object" ? this.jsonObj(arrayItem, ind.toString(), schema.items[ind], path+"["+ind+"]"):
                            type === "array" ? this.jsonArray(arrayItem, ind.toString(), schema.items.type, schema.items.hasOwnProperty("enum"), schema.items[ind], path+"["+ind+"]"):
                            type === "boolean" ? this.jsonBoolean(arrayItem, ind.toString(), path+"["+ind+"]"):
                            this.jsonString(arrayItem as string, ind.toString(), path+"["+ind+"]")}
                        </div>)
                    }
                </div>
                <p>]</p>
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        this.updateConfig([...value, ""], path);
                    }}
                    startIcon={<AddIcon fontSize="small"/>}>
                    Add Item
                </Button>
            </div>
        );
    }

    jsonBoolean(value: boolean, field: string, path: string){
        let valBool = value as unknown as boolean;
        return(
            <div className="boolean-field property">
                <p className="field-label">{field}:</p>
                <Checkbox checked={valBool} onChange={event => this.updateConfig(!valBool, path)} />
            </div>
        );
    }

    jsonEnum(val: string, field: string, options: Array<string>, path: string){

        return(
            <div className="enum-field property">
                <p className="field-label">{field}:</p>
                <ToggleButtonGroup
                color="primary"
                size="small"
                value={val}
                exclusive={false}
                onChange={event => this.updateConfig((event.target as HTMLInputElement).value, path)}
                aria-label="Platform"
                >
                    {options.map((opt:string) => <ToggleButton value={opt}>{opt}</ToggleButton>)}
                </ToggleButtonGroup>
            </div>
        );
    }

    
    jsonObjPlain(value: any, field: string, path: string, seperator: string){
        return (
            <div>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id={"obj-"+value+"-"+field}>
                        <Typography>{field}</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        {Object.entries(value).map((property) => 
                            <div>
                                {
                                    typeof property[1] === "string" ? this.jsonString(property[1], property[0], path + seperator + property[0]) :
                                    typeof property[1] === "number" ? this.jsonNumber(property[1], property[0], path + seperator + property[0]) :
                                    typeof property[1] === "object" ? this.jsonObjPlain(property[1], property[0], path + seperator + property[0], '.') :
                                    typeof property[1] === "boolean" ? this.jsonBoolean(property[1], property[0], path + seperator + property[0]) :
                                    <></>
                                }
                            </div>
                        )}
                    </AccordionDetails>

                </Accordion>
            </div>
        );
    }


    /**
     * Render
     */
    render() {
        // If viewing plain json with no schema requirements 
        if(this.state.cmd === "view"){
            return (
                <ThemeProvider theme={theme}>
                    <div>
                        <h2>JSON Editor</h2>

                        {this.jsonObjPlain(this.state.config, '', '', '')}
                        <Button 
                            variant="contained"
                            size="small"
                            className="submit-button" 
                            endIcon={<CheckIcon />}
                            onClick={() => {
                                this.saveJSON();
                            }}
                            >
                            Save Changes
                        </Button>
                    </div>
                </ThemeProvider>
            );
        } else { // either edit or new mission commands
            if (this.state.cmd === "new"){
                return (
                    <ThemeProvider theme={theme}>
                    <React.Fragment>
                        <div className="new-mission">
                            <Button className="new-mission-content" variant="outlined" onClick={() => {this.createNewMission();}}>
                                Create New Mission JSON
                            </Button>
                        </div>
                    </React.Fragment>
                    </ThemeProvider>
                );
            }

            if (validate(this.state.config)){
                return (
                    <ThemeProvider theme={theme}>
                    <React.Fragment>
                        <h2>Mission Editor</h2>
                        {this.jsonObject(this.state.config, '')}
                        <Button 
                            variant="contained"
                            size="small"
                            className="submit-button" 
                            endIcon={<CheckIcon />}
                            onClick={() => {
                                this.saveJSON();
                            }}
                            >
                            Save Changes
                        </Button>
                    </React.Fragment>
                    </ThemeProvider>
                );
    
            } else { // mission json does not fit schema requirements for mission
                return (
                    <ThemeProvider theme={theme}>
                    <React.Fragment>
                        <div>
                        {validate.errors!.map((e, index) => (<ErrorMessage key={index} title={e.keyword} message={e.message} params={e.params}/>))}
                        </div>
                    </React.Fragment>
                    </ThemeProvider>
                );
            }
        }
    }
}

// TODO: Lots to impove on in furture to make error message more helpful
function ErrorMessage(info: any){
    var displayTitle = "";
    displayTitle = (info.title === "required") ? "Missing Requirement" : (info.title==="type")? "Wrong Type for Field" : "Unrecongnized Field";
    var field = '';
    if (info.title === "additionalProperties") {
        field = info.params.additionalProperty;
    } 
    let msg = info.message;
    if (!(info.title === "type")){
        msg = msg + ' \'' + field + '\''
    }
    return(
        <div className="error-bar">
            <h1> Error: </h1>
            <p> {displayTitle} : {msg}</p>
        </div>
    );
}