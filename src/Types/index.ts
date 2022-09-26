export type stylers = {
    color?: string;
    visibility?: 'off' | 'on';
};

export type MapTypes = {
    featureType: string;
    elementType?: string;
    stylers: stylers[];
};
