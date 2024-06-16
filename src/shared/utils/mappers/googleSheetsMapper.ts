import { FigmaGoogleSheet, FigmaGoogleSheetValues, GoogleSheet, Value } from "../../types";

export const googleSheetsToFigmaMapper = (sheets:  GoogleSheet[]): FigmaGoogleSheet[] => {
    return sheets.map((sheet) => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
        type: sheet.properties.sheetType
    }));
}

export const googleSheetsDataToFigmaMapper = (headers: Value[], values: Value[][]): FigmaGoogleSheetValues[][] => {
    const sortedHeaders = headers.sort((a, b) => a.index - b.index).map((header) => header.value);

    return values.map((row) => row.map((cell) => ({
        [sortedHeaders[cell.index]]: cell.value
    })));
}

export const googleSheetsValuesRowsToFigmaMapper = ({ values, headers, collectionNameKey }: { values: Value[][], headers: Value[], collectionNameKey: Value}): { [key: string]: { [key: string]: string }; } => {
    return values.reduce((acc, row) => {
        const key = row.find((cell) => cell.index === collectionNameKey.index)?.value;
        const values = row.filter((cell) => cell.index !== collectionNameKey.index);

        if (!key) return acc;
        return {
            ...acc,
            [key]: values.reduce((acc, cell) => ({
                ...acc,
                [headers[cell.index].value]: cell.value
            }), {})
        }
    }, {});
};