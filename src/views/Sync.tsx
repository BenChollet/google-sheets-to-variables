import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, chakra, Select, Switch, Text } from "@chakra-ui/react";

import { FigmaUiMessage, SyncAccumulator, SyncFigmaCounters, Value } from "../shared/types";

type CounterRowProps = {
    accumulator: SyncAccumulator;
    label: string;
};

function CounterRow({ accumulator, label }: CounterRowProps) {
    return <Text fontSize="xs" color={accumulator.color}>{label} : {accumulator.tokens.count}</Text>;
}

const SyncContainerStyled = chakra('section', {});

const SwitchesContainerStyled = chakra('div', {
    baseStyle: {
        display: "grid",
        width: "100%",
        gridTemplateColumns: '50% 50%',
        rowGap: "0.5rem",

        "& > div": {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
    },
});

const CountersContainerStyled = chakra('div', {
    baseStyle: {
        display: "flex",
        width: "100%",
        justifyContent: "space-evenly",
    },
});
export default function Sync() {
    const navigate = useNavigate();

    const [headers, setHeaders] = useState<Value[] | null>(null);
    const [collectionNameKey, setCollectionNameKey] = useState<Value | null>(null);
    const [selectedNodes, setSelectedNodes] = useState<Value[]>([]);
    const [syncCounters, setSyncCounters] = useState<SyncFigmaCounters | null>(null);
    const figmaUiSyncHandler = async (figmaUiEvent: FigmaUiMessage) => {
        if (figmaUiEvent.data.pluginMessage.type === 'syncError') navigate("/settings");

        if (figmaUiEvent.data.pluginMessage.type === 'syncSuccess') {
            const { headers} = figmaUiEvent.data.pluginMessage;
            setHeaders(headers);
        }

        if (figmaUiEvent.data.pluginMessage.type === 'startSyncSuccess') {
            const { tokensCounters} = figmaUiEvent.data.pluginMessage;
            setSyncCounters(tokensCounters);
        }
    };

    useEffect(() => {
        parent.postMessage(
            { pluginMessage: { type: 'sync' } },
            '*'
        );

        // Listen to messages from the plugin
        addEventListener("message", figmaUiSyncHandler);
        return () => removeEventListener("message", figmaUiSyncHandler);
    }, [])

    const selectableNodes = useMemo(() => {
        if (!headers || !collectionNameKey) return null;
        return headers.filter((header) => header.index !== collectionNameKey.index);
    }, [headers, collectionNameKey]);

    const handleClick = () => {
        if (!collectionNameKey || !selectedNodes.length) return;
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'startSync',
                    input: {
                        collectionNameKey,
                        selectedNodes,
                        headers
                    }
                }
            },
            '*'
        );
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedHeader = headers?.find((header) => header.index === Number(event.target.value));
        setSelectedNodes([]);
        setCollectionNameKey(selectedHeader ?? null);
    }

    const handleSwitch = (value: Value) => {
        setSyncCounters(null);
        setSelectedNodes((prev) => {
            if (prev.includes(value)) return prev.filter((node) => node.index !== value.index);
            return [...prev, value];
        });
    }

    return (
        <SyncContainerStyled>
            <h2>Synchronize</h2>
            <Select size='md' placeholder='Figma collection "Name" key' onChange={handleChange}>
                {headers && headers.map((header) => (
                    <option key={`${header.index}-${header.value}`} value={header.index}>{header.value}</option>))}
            </Select>
            <SwitchesContainerStyled>
                {selectableNodes && selectableNodes.map((node) => (
                    <div key={`${node.index}-${node.value}`}>
                        <Switch isChecked={selectedNodes.includes(node)} onChange={() => handleSwitch(node)} size='md' colorScheme="brand"/>
                        <p>{node.value}</p>
                    </div>
                ))}
            </SwitchesContainerStyled>
            <Button onClick={handleClick} colorScheme="brand" size='sm'>
                Import & Sync
            </Button>
            {syncCounters && (
                <CountersContainerStyled>
                    <CounterRow label="Created" accumulator={syncCounters.created} />
                    <CounterRow label="Updated" accumulator={syncCounters.updated} />
                    <CounterRow label="Deleted" accumulator={syncCounters.deleted} />
                </CountersContainerStyled>
            )}
        </SyncContainerStyled>
    )
}