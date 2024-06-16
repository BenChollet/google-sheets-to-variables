import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from "@chakra-ui/react"

// # VIEWS
import FirstRun from './views/FirstRun';
import Setup from './views/Setup';
import Settings from './views/Settings';
import Sync from './views/Sync';

const theme = extendTheme({
    colors: {
        brand: {
            50: "#F4F6F7",
            100: "#E2E9EB",
            200: "#C7D4DA",
            300: "#A1B6BF",
            400: "#7893A1",
            500: "#577383",
            600: "#4B606F",
            700: "#41515D",
            800: "#3B464F",
            900: "#343C45",
            950: "#20262C"
        },
    },
    styles: {
        global: {
            // Global styles here
            body: {
                bg: '#f4f6f7',
                color: '#41515d',
            },
            h2: {
                fontSize: '2rem',
                lineHeight: '2.5rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
            },
            section: {
                width: '100%',
                height: '100%',
                padding: '15px 25px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',

                button: {
                    width: '100%',
                }
            },
            // View styles here
            // // FirstRun
            "#firstRun": {
                ".plugin_description": {
                    fontSize: "0.8rem",
                    lineHeight: "1rem",
                    color: "#A1B6BF",
                },
            },
            // // Setup
            // // Source
            // // Sync
            "#sync": {
                ".switches-container": {
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
            },
        }
    },
})

function App() {
    return (
        <ChakraProvider theme={theme}>
            <MemoryRouter initialEntries={['/initialization']} future={{v7_startTransition: true}}>
                <Routes>
                    <Route path="initialization" element={<FirstRun/>}/>
                    <Route path="setup" element={<Setup/>}/>
                    <Route path="settings" element={<Settings/>}/>
                    <Route path="sync" element={<Sync/>}/>
                </Routes>
            </MemoryRouter>
        </ChakraProvider>
    );
}

const rootElement = document.getElementById('react-page');
if (!rootElement) {
    console.error("⚠️ Couldn't find the root element");
} else {
    ReactDOM.createRoot(rootElement).render(<App />);
}