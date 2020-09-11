import React, { ReactNode } from 'react';
import { HostsProvider } from '../context/HostsContext';
import { SettingsProvider } from '../context/SettingsContext';
import Home from '../components/Home';

export default function App() {
   return (
      <HostsProvider>
         <SettingsProvider>
            <Home />
         </SettingsProvider>
      </HostsProvider>
   );
}
