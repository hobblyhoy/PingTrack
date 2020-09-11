import React, { useState, createContext, ReactNode, useEffect } from 'react';
import { Host } from '../types';
import { ipcRenderer } from 'electron';

type HostContextType = {
    hosts: Host[],
    setHosts: (value: Host[]) => void
}
export const HostsContext = createContext<HostContextType | undefined>(undefined);

type Props = {
    children: ReactNode;
};
export const HostsProvider = (props: Props) => {
    const [hosts, setHosts] = useState<Host[]>([]);

    // Init
    useEffect(() => {
        // We want the hosts to persist across loads so we save/recall from local storage
        let lsHosts = localStorage.getItem('hosts');
        if (lsHosts) {
            setHosts(JSON.parse(lsHosts));
        } else {
            setHosts([{
                    id: (new Date()).getTime(),
                    name: '8.8.8.8',
                    isEnabled: true,
                    isBrandNew: false
                },
                {
                    id: (new Date()).getTime() + 1,
                    name: 'google.com',
                    isEnabled: true,
                    isBrandNew: false
                }]
            );
        }

    }, []);

    // Updates
    useEffect(() => {
        ipcRenderer.send('hostsUpdate', hosts);
        localStorage.setItem('hosts', JSON.stringify(hosts));
    }, [hosts]);

    return (
        <HostsContext.Provider value={[hosts, setHosts]}>
            {props.children}
        </HostsContext.Provider>
    );
}