import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Input } from '@chakra-ui/react';

import { GoogleSheetsErrorReason } from "../shared/types";
import BasicInput from "../components/forms/input/BasicInput.ts";

export default function Setup() {
    const navigate = useNavigate();

    const [sheetId, setSheetId] = React.useState<string>('');
    const [apiKey, setApiKey] = React.useState<string>('');
    const [error, setError] = React.useState<GoogleSheetsErrorReason | null>(null);

    const figmaUiSetupHandler = async (figmaUiEvent: MessageEvent) => {
        if (figmaUiEvent.data.pluginMessage.type === 'fetchGoogleSheetsError') {
            const { error } = figmaUiEvent.data.pluginMessage;
            setError(error);
        }

        if (figmaUiEvent.data.pluginMessage.type === 'fetchGoogleSheetsSuccess') {
            navigate("/settings")
        }
    };

    useEffect(() => {
        // Listen to messages from the plugin
        addEventListener("message", figmaUiSetupHandler);
        return () => removeEventListener("message", figmaUiSetupHandler);
    }, [])

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setter(event.target.value);
    };

    const handleClick = () => {
        if (!sheetId) return setError(GoogleSheetsErrorReason.GOOGLE_SHEETS_ID_INVALID);
        if (!apiKey) return setError(GoogleSheetsErrorReason.API_KEY_INVALID);

        parent.postMessage(
            { pluginMessage: { type: 'fetchGoogleSheets', credentials: { sheetId, apiKey } } },
            '*'
        );
    };

    return (
        <section>
            <h2>Setup</h2>
            <BasicInput
                placeholder="Google Sheet ID"
                onChange={handleChange(setSheetId)}
                isErrored={error === GoogleSheetsErrorReason.GOOGLE_SHEETS_ID_INVALID}
                errorMessage="Invalid Google Sheet ID" />
            <BasicInput
                placeholder="Google Sheet API key"
                onChange={handleChange(setApiKey)}
                isErrored={error === GoogleSheetsErrorReason.API_KEY_INVALID}
                errorMessage="Invalid Google API KEY" />
            <Button onClick={handleClick} colorScheme="brand" size='sm'>
                Check & save
            </Button>
        </section>
    )
}