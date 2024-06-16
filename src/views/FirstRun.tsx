import * as React from "react";
import { useNavigate } from 'react-router-dom';

import { Button } from '@chakra-ui/react'

// # ASSETS
import Logo from "../shared/assets/Logo";
import {useEffect} from "react";

export default function FirstRun() {
    const navigate = useNavigate();
    const figmaUiInitHandler = async (figmaUiEvent: MessageEvent) => {
        if (figmaUiEvent.data.pluginMessage.type === 'initSuccess') {
            const { isInit } = figmaUiEvent.data.pluginMessage;
            if (isInit) navigate("/settings");
        }
    };

    useEffect(() => {
        parent.postMessage(
            { pluginMessage: { type: 'init' } },
            '*'
        );

        // Listen to messages from the plugin
        addEventListener("message", figmaUiInitHandler);
        return () => removeEventListener("message", figmaUiInitHandler);
    }, []);

    const handleClick = () => {
        navigate("/setup");
    };

    return (
        <section id="firstRun">
            <Logo strokeColor="#577383" />
            <p className="plugin_description">Your Figma plugin serves as a bridge between Google Sheets and Figma, enabling a seamless data integration process.
                After a simple setup, the plugin fetches data from Google Sheets via its API and populates the Figma variables collection.
                This functionality allows for dynamic and real-time updates of Figma designs with data from Google Sheets, enhancing efficiency and accuracy in design workflows.</p>
            <Button onClick={handleClick} colorScheme="brand" size='sm'>
                Start
            </Button>
        </section>
    )
}