import type { MapTypes } from 'Types';

export const exampleMapStyles: MapTypes[] = [
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#e6e9ec',
            },
        ],
    },
    {
        featureType: 'landscape.natural.landcover',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#e6e9ec',
            },
        ],
    },
    {
        featureType: 'landscape.natural.terrain',
        elementType: 'geometry.fill',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'poi.business',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#a6b5db',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#a6b5cb',
            },
        ],
    },
];
