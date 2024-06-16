import { fetchGoogleSheetData, fetchGoogleSheets, parseGoogleSheetValues } from "./shared/utils/GoogleSheets";

import { FigmaEvent, FigmaMessage, GoogleSheet } from "./shared/types";
import {
    googleSheetsToFigmaMapper,
    googleSheetsValuesRowsToFigmaMapper
} from "./shared/utils/mappers/googleSheetsMapper";
import { syncFigmaTokens } from "./shared/utils/Figma";

figma.showUI(__html__, { themeColors: true, width: 350, height: 400 });

figma.ui.onmessage = async (messageEvent: FigmaEvent) => {
    if (messageEvent.type === 'init') {
        const [googleSheetId, googleApiKey, googleSheets] =  [
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheetId`),
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleApiKey`),
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheets`)
        ];

        return figma.ui.postMessage({
            type: 'initSuccess',
            isInit: googleApiKey !== undefined && googleSheetId !== undefined && googleSheets !== undefined
        });
    }

    if (messageEvent.type === 'reset') {
        await figma.clientStorage.deleteAsync(`${figma.currentPage.id}:googleSheetId`);
        await figma.clientStorage.deleteAsync(`${figma.currentPage.id}:googleApiKey`);
        await figma.clientStorage.deleteAsync(`${figma.currentPage.id}:googleSheets`);

        return figma.ui.postMessage({
            type: 'resetSuccess'
        });
    }

    if (messageEvent.type === 'fetchGoogleSheets') {
        const response = await fetchGoogleSheets(messageEvent.credentials);

        if ('error' in response) {
            return figma.ui.postMessage({
                type: 'fetchGoogleSheetsError',
                error: response.error
            });
        }

        await figma.clientStorage.setAsync(`${figma.currentPage.id}:googleSheetId`, messageEvent.credentials.sheetId);
        await figma.clientStorage.setAsync(`${figma.currentPage.id}:googleApiKey`, messageEvent.credentials.apiKey);
        await figma.clientStorage.setAsync(`${figma.currentPage.id}:googleSheets`, JSON.stringify(response.sheets));

        return figma.ui.postMessage({
            type: 'fetchGoogleSheetsSuccess'
        })
    }

    if (messageEvent.type === 'settings') {
        const localCollections = await figma.variables.getLocalVariableCollectionsAsync();

        const googleSheets =
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheets`);

        const parsedSheets: GoogleSheet[] = JSON.parse(googleSheets);

        return figma.ui.postMessage({
            type: 'settingsSuccess',
            collections: localCollections.map((collection) => ({
                id: collection.id,
                key: collection.key,
                name: collection.name,
                variableLength: collection.variableIds.length
            })),
            sheets: googleSheetsToFigmaMapper(parsedSheets),
        });
    }

    if (messageEvent.type === 'fetchGoogleSheetData') {
        const [googleSheetId, googleApiKey] =  [
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheetId`),
            await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleApiKey`)
        ];

        const response = await fetchGoogleSheetData({ sheetId: googleSheetId, apiKey: googleApiKey, source: messageEvent.input.source });

        if ('error' in response) {
            return figma.ui.postMessage({
                type: 'fetchGoogleSheetDataError',
                error: response.error
            });
        }

        await figma.clientStorage.setAsync(`${figma.currentPage.id}:googleSheetValues`, JSON.stringify(response.values));
        await figma.clientStorage.setAsync(`${figma.currentPage.id}:destination`, messageEvent.input.destination);

        return figma.ui.postMessage({
            type: 'fetchGoogleSheetDataSuccess'
        });
    }

    if (messageEvent.type === 'sync') {
        const googleSheetValues = await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheetValues`);

        if (googleSheetValues === undefined) {
            return figma.ui.postMessage({
                type: 'syncError',
                error: 'Google Sheet values not found'
            } satisfies FigmaMessage);
        }

        const { headers } = parseGoogleSheetValues(JSON.parse(googleSheetValues));

        if (!headers) {
            return figma.ui.postMessage({
                type: 'syncError',
                error: 'Google Sheet values not found'
            } satisfies FigmaMessage);
        }

        return figma.ui.postMessage({
            type: 'syncSuccess',
            headers: headers,
        } satisfies FigmaMessage);
    }

    if (messageEvent.type === 'startSync') {
        const { collectionNameKey, selectedNodes } = messageEvent.input;

        const googleSheetValues = await figma.clientStorage.getAsync(`${figma.currentPage.id}:googleSheetValues`);

        if (googleSheetValues === undefined) {
            return figma.ui.postMessage({
                type: 'startSyncError',
                error: 'Google Sheet values not found'
            } satisfies FigmaMessage);
        }

        const { headers, values } = parseGoogleSheetValues(JSON.parse(googleSheetValues));

        if (!headers) {
            return figma.ui.postMessage({
                type: 'startSyncError',
                error: 'Google Sheet values not found'
            } satisfies FigmaMessage);
        }

        const destinationCollectionKey: string = await figma.clientStorage.getAsync(`${figma.currentPage.id}:destination`);

        const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
        const destinationCollection = localCollections.find((collection) => collection.key === destinationCollectionKey);

        if (!destinationCollection) {
            return figma.ui.postMessage({
                type: 'startSyncError',
                error: 'Destination collection not found'
            } satisfies FigmaMessage);
        }
        const filteredValues = values.map((row) => row.filter((cell) => cell.index === collectionNameKey.index || selectedNodes.some((node) => node.index === cell.index)));
        const formattedValues = googleSheetsValuesRowsToFigmaMapper({ values: filteredValues, headers, collectionNameKey });

        const syncFigmaTokensCounters = syncFigmaTokens({
            selectedNodes,
            collection: destinationCollection,
            type: 'STRING',
            values: formattedValues,
        });

        return figma.ui.postMessage({
            type: 'startSyncSuccess',
            tokensCounters: syncFigmaTokensCounters,
        } satisfies FigmaMessage);
    }
};