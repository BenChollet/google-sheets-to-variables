import {SyncFigmaCounters, Value} from "../types";

type SyncInput = {
    selectedNodes: Value[];
    collection: VariableCollection,
    type: VariableResolvedDataType,
    values: {
        [key: string]: { [key: string]: string }
    }
}

type CreateFigmaTokenInput = {
    name: string,
    collection: VariableCollection,
    type: VariableResolvedDataType,
    values:  { [key: string]: string }
}

type UpdateFigmaTokenInput = {
    variable: Variable,
    values: { [key: string]: string },
    collection: VariableCollection,
}

type UpdateFigmaModesInput = {
    collection: VariableCollection,
    selectedNodes: Value[],
}

function createFigmaToken({ name, collection, type, values }: CreateFigmaTokenInput) {
    const token = figma.variables.createVariable(name, collection.id, type);
    Object.keys(values).map((key) => {
        const currentValue = values[key];
        const matchingMode = collection.modes.find((mode) => mode.name === key);
        if (matchingMode) {
            token.setValueForMode(matchingMode.modeId, currentValue);
        } else {
            const newMode = collection.addMode(key.trim())
            token.setValueForMode(newMode, currentValue);
        }
    });
}
function updateFigmaToken({ variable, values, collection }: UpdateFigmaTokenInput) {
    Object.keys(values).map((key) => {
        const currentValue = values[key];
        const matchingMode = collection.modes.find((mode) => mode.name === key);
        if (matchingMode) {
            variable.setValueForMode(matchingMode.modeId, currentValue);
        } else {
            const newMode = collection.addMode(key.trim())
            variable.setValueForMode(newMode, currentValue);
        }
    });
}

function updateFigmaModes({ collection, selectedNodes }: UpdateFigmaModesInput) {
    const collectionModes = collection.modes;
    const collectionModesLen = collectionModes.length;

    selectedNodes.map((mode, index) => {
        const collectionModeAtIndex = collectionModes[index]
        const isSameAtIndex = collectionModeAtIndex.name === mode.value;

        if (isSameAtIndex) return;

        if (index <= collectionModesLen) return collection.renameMode(collectionModeAtIndex.modeId, mode.value);
        collection.addMode(mode.value);
    });
}

export function syncFigmaTokens({ selectedNodes, collection, type, values }: SyncInput): SyncFigmaCounters {
    updateFigmaModes({ collection, selectedNodes });
    const collectionVariables: { [key: string]: Variable } = collection.variableIds.reduce((acc, id) => {
        const variable = figma.variables.getVariableById(id);
        if (!variable) return acc;
        return {
            ...acc,
            [variable.name]: variable
        }
    }, {});

    const collectionVariablesToDelete = Object.keys(collectionVariables).filter((variableKey) => !values[variableKey]);
    collectionVariablesToDelete.map((variableKey) => collectionVariables[variableKey].remove());

    const counters: SyncFigmaCounters = {
        created: {
            tokens: {
                label: 'Variables created',
                count: 0,
            },
            modes: {
                label: 'Modes created',
                count: 0
            },
            color: '#9ECB9A'
        },
        deleted: {
            tokens: {
                label: 'Variables deleted',
                count: collectionVariablesToDelete.length,
            },
            modes: {
                label: 'Modes deleted',
                count: 0,
            },
            color: '#E53E3E',
        },
        updated: {
            tokens: {
                label: 'Variables updated',
                count: 0,
            },
            modes: {
                label: 'Modes updated',
                count: 0,
            },
            color: '#F79B5F',
        },
    };
    Object.keys(values).map((key) => {
        const currentValues = values[key];
        const existingkey = Object.keys(collectionVariables).find((variableKey) => variableKey === key);

        if (existingkey) {
            const matchingVariable = collectionVariables[existingkey];

            updateFigmaToken({ variable: matchingVariable, values: currentValues, collection });
            counters.updated.tokens.count++;
        } else {
            createFigmaToken({ name: key, collection, type, values: currentValues });
            counters.created.tokens.count++;
        }
    });

    return counters;
}