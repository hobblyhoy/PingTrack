import React, { useState, createContext, ReactNode, useEffect } from 'react';
import { SettingsUpdate } from '../types';
import { ipcRenderer } from 'electron';

export const SettingsContext = createContext<SettingsUpdate | undefined>(undefined);

type Props = {
    children: ReactNode;
};
export const SettingsProvider = (props: Props) => {
    const [settings, setSettings] = useState<SettingsUpdate>({
        timeBetweenPings_ms: 5000,
        warningTimeout: 0,
        chartNodesToDisplay: 50,
    });

    useEffect(() => {
        ipcRenderer.send('settingsUpdate', settings);
    }, [settings]);

    return (
        <SettingsContext.Provider value={[settings, setSettings]}>
            {props.children}
        </SettingsContext.Provider>
    );
}