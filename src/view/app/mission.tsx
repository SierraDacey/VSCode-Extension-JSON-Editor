import { JSONSchemaType } from "ajv";

/**
 * Initial schema for a mission
 * Defines how all mission configurations files should be set up
 */

interface RobotData{
    name:string;
    actuatorList: Array<string>
}

interface MissionData{
    name: string;
    description?: string;
    robot: RobotData;
    id: number;
    test: boolean;
    mission: string;
}

export const missionSchema: JSONSchemaType<MissionData> = {
    type: "object",
    required: ["name", "id", "test", "robot", "mission"],
    additionalProperties: false,
    properties: {
        name: {type: "string"},
        description: {type: "string", nullable: true},
        id: {type: "number"},
        robot: {type: "object", required:["name", "actuatorList"], properties: { name:{type: "string"}, actuatorList:{type:"array", items:{type:"string"}}}},
        test: {type: "boolean"},
        mission: {type: "string", enum: ["surface", "subsurface", "airborne"]}
    }
};

export const blankMission = {
    name: '',
    description: '',
    id: 0,
    robot: {name:'', actuatorList:[]},
    test: true,
    mission: 'surface'
};