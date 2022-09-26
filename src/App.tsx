import './App.css';

import { Routes, Route } from 'react-router-dom';

import { Home } from 'features';
import { MainLoader } from 'Components';

import { useJsApiLoader } from '@react-google-maps/api';

const App = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API,
    });
    if (!isLoaded) {
        return <MainLoader />;
    }

    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </div>
    );
};

export default App;
