import {GOOGLE_SHEETS_BASE_URL} from "../constants";
import {
    GoogleSheetsCredentials,
    GoogleSheetsDataInput,
    GoogleSheetsDataResponse,
    GoogleSheetsErrorReason,
    GoogleSheetsResponse, Value
} from "../types";

type ResponseError = {
    error: GoogleSheetsErrorReason;
};

type ParseValuesResponse = {
    headers?: Value[];
    values: Value[][];
};

export async function fetchGoogleSheets({ sheetId, apiKey }: GoogleSheetsCredentials): Promise<GoogleSheetsResponse | ResponseError> {
    const response = await fetch(`${GOOGLE_SHEETS_BASE_URL}/${sheetId}/?key=${apiKey}`);
    const json: GoogleSheetsResponse = await response.json();

    if ('error' in json) {
        const details = json.error.details ?? null;
        const reason = details?.[0]?.reason ?? null

        if (reason === GoogleSheetsErrorReason.API_KEY_INVALID) return { error: GoogleSheetsErrorReason.API_KEY_INVALID };
        return { error: GoogleSheetsErrorReason.GOOGLE_SHEETS_ID_INVALID }
    }

    return json;
}

export async function fetchGoogleSheetData({ sheetId, apiKey, source }: GoogleSheetsDataInput): Promise<GoogleSheetsDataResponse> {
    const response = await fetch(`${GOOGLE_SHEETS_BASE_URL}/${sheetId}/values/${source}?key=${apiKey}`);
    return await response.json();
}

export function parseGoogleSheetValues(values: string[][]): ParseValuesResponse {
    const parsedValues: Value[][] = values.map((row: string[]) => row.map((cell, index) => ({
        index,
        value: cell
    })));
    const headers = parsedValues.shift();

    return { headers, values: parsedValues }
}