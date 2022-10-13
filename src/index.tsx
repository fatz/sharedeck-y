import { definePlugin, ServerAPI, staticClasses, PanelSection } from 'decky-frontend-lib';
import React from 'react';
import { FaCogs } from 'react-icons/fa';
import { ShareDecky } from './components/ShareDecky/ShareDecky';
import { AppContextProvider } from './context/Context';

export default definePlugin((serverApi: ServerAPI) => {
  console.log('Loading ShareDeck-y');
  return {
    title: <div className={staticClasses.Title}>ShareDeck-y</div>,
    content: (
      <AppContextProvider>
        <ShareDecky serverApi={serverApi} />
      </AppContextProvider>
    ),
    icon: <FaCogs />,
  };
})
