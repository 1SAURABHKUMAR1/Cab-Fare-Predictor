import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';

import { ChakraProvider } from '@chakra-ui/react';
import theme from './customTheme';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(container);

root.render(
    <React.StrictMode>
        <ChakraProvider resetCSS={true} theme={theme}>
            <Toaster position="top-right" reverseOrder={false} />
            <Router>
                <App />
            </Router>
        </ChakraProvider>
    </React.StrictMode>,
);
