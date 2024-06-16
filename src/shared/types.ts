export type SelectOption = {
    value: string;
    label: string;
};

// GOOGLE SHEETS
export type GoogleSheetsCredentials = {
    sheetId: string;
    apiKey: string;
};

export type GoogleSheetsDataInput = GoogleSheetsCredentials & {
    source: string;
};

export type GoogleSheet = {
    properties: {
        index: number;
        sheetId: number;
        sheetType: string;
        title: string;
        gridProperties: {
            rowCount: number;
            columnCount: number;
        };
    };
};

export enum GoogleSheetsErrorReason {
    GOOGLE_SHEETS_ID_INVALID = "GOOGLE_SHEETS_ID_INVALID",
    API_KEY_INVALID = "API_KEY_INVALID"
}

export type GoogleSheetsResponseErrorDetail = {
    reason: GoogleSheetsErrorReason;
};

export type GoogleSheetsResponse =
    | {
    spreadsheetId: string;
    spreadsheetUrl: string;
    sheets: GoogleSheet[];
    }
    | {
        error: {
            code: number;
            message: string;
            status: string;
            details?: GoogleSheetsResponseErrorDetail[];
        };
    };

export type GoogleSheetsDataResponse =
    | {
        range: string;
        majorDimension: string;
        values: string[][];
    }
    | {
    error: {
        code: number;
        message: string;
        status: string;
    };
};

// FIGMA
export type FigmaUiMessage = {
    data: {
        pluginMessage: FigmaMessage;
    }
};

export type FigmaEvent =
    | {
        type: 'fetchGoogleSheetData';
        input: {
            source: string;
            destination: string;
        };
    }
    | {
        type: 'fetchGoogleSheets';
        credentials: GoogleSheetsCredentials;
    }
    | {
        type: 'startSync'
        input: {
            collectionNameKey: Value;
            selectedNodes: Value[];
            headers: Value[];
        }
    }
    | { type: 'settings' }
    | { type: 'setup' }
    | { type: 'sync' }
    | { type: 'init' }
    | { type: 'reset' };

export type Value = {
    index: number;
    value: string
}

export type FigmaGoogleSheetValues = {
    [key: string]: string;
}

type SyncIndicator = { label: string; count: number; }

export type SyncAccumulator = {
    tokens: SyncIndicator,
    modes: SyncIndicator,
    color: string,
};

export type SyncFigmaCounters = {
    deleted: SyncAccumulator,
    updated: SyncAccumulator,
    created: SyncAccumulator,
};

export type FigmaMessage =
    | { type: 'syncError', error: 'Google Sheet values not found' }
    | { type: 'startSyncError', error: 'Google Sheet values not found' | 'Destination collection not found' }
    | { type: 'syncSuccess'; headers: Value[]; }
    | { type: 'startSyncSuccess'; tokensCounters: SyncFigmaCounters; };

export type FigmaCollection = {
    id: string;
    key: string;
    name: string;
    variableLength: number;
};

export type FigmaGoogleSheet = {
    id: number;
    title: string;
    type: string;
};