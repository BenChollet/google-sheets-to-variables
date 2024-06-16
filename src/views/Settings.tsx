import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Select } from '@chakra-ui/react'

import {FigmaCollection, FigmaGoogleSheet} from "../shared/types";

export default function Settings() {
    const navigate = useNavigate();

    const [sheets, setSheets] = React.useState<FigmaGoogleSheet[]>([]);
    const [collections, setCollections] = React.useState<FigmaCollection[]>([]);

    const [selectedSheetTitle, setSelectedSheetTitle] = React.useState<string | null>(null);
    const [selectedCollectionKey, setSelectedCollectionKey] = React.useState<string | null>(null);
    const figmaUiSettingsHandler = async (figmaUiEvent: MessageEvent) => {
        if (figmaUiEvent.data.pluginMessage.type === 'settingsSuccess') {
            const { collections, sheets } = figmaUiEvent.data.pluginMessage;

            setSheets(sheets);
            setCollections(collections);
        }

        if (figmaUiEvent.data.pluginMessage.type === 'fetchGoogleSheetDataSuccess') navigate("/sync");

        if (figmaUiEvent.data.pluginMessage.type === 'resetSuccess') navigate("/initialization")
    };

    useEffect(() => {
        parent.postMessage(
            { pluginMessage: { type: 'settings' } },
            '*'
        );

        // Listen to messages from the plugin
        addEventListener("message", figmaUiSettingsHandler);
        return () => removeEventListener("message", figmaUiSettingsHandler);
    }, [])

    const handleClick = () => {
        if (!selectedSheetTitle || !selectedCollectionKey) return;

        parent.postMessage(
            { pluginMessage: { type: 'fetchGoogleSheetData', input: { source: selectedSheetTitle, destination: selectedCollectionKey } } },
            '*'
        );
    };

    const handleChangeSelectedSheet = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSheet = sheets.find((sheet) => String(sheet.id) === event.target.value);
        setSelectedSheetTitle(selectedSheet?.title ?? null);
    };
    const handleChangeSelectedCollection = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedCollectionKey(event.target.value);

    return (
        <section>
            <h2>Settings</h2>
            <Select size='md' placeholder='Select a source page' onChange={handleChangeSelectedSheet}>
                {sheets.map((sheet) => (<option key={`${sheet.id}-${sheet.title}`} value={sheet.id}>{sheet.title}</option>))}
            </Select>
            <Select size='md' placeholder='Select a destination collection' onChange={handleChangeSelectedCollection}>
                {collections.map((collection) => (<option key={`${collection.key}`} value={collection.key}>{collection.name}</option>))}
            </Select>
            <Button onClick={handleClick} colorScheme="brand" size='sm'>
                Select
            </Button>
        </section>
    )
}