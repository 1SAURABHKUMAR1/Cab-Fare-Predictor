export type stylers = {
    color?: string;
    visibility?: 'off' | 'on';
};

export type MapTypes = {
    featureType: string;
    elementType?: string;
    stylers: stylers[];
};

export type cabType = {
    id: 'mini' | 'prime' | 'sedan' | 'suv';
    title: 'Mini' | 'Sedan' | 'Fare XLs' | 'Prime SUV';
    image: 'mini' | 'prime' | 'sedan' | 'suv';
    description: string;
    perKm: number;
};

export type bookingType = {
    Dated: string;
    Pickup: string;
    Destination: string;
    Distance: string;
    'Trip Duration': string;
    'Trip Fare': string;
};
