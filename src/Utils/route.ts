import SuccessToast from 'Utils/Toast/Success';
import ErrorToast from 'Utils/Toast/Error';
import { ClearSuggestions } from 'use-places-autocomplete';

export const getCurrentLocation = async ({
    pickupRef,
    setPickupLocation,
    clearSuggestions,
}: {
    pickupRef: React.MutableRefObject<HTMLInputElement | null>;
    setPickupLocation: React.Dispatch<React.SetStateAction<string>>;
    clearSuggestions: ClearSuggestions;
}) => {
    await navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAP_API}`,
            );
            const data = await res.json();
            if (!(data.status === 'OK')) {
                ErrorToast('Failed');
            }
            const { compound_code } = data.plus_code;
            pickupRef.current &&
                (pickupRef.current.value =
                    compound_code ?? 'Your current location');
            setPickupLocation(() => compound_code);
            clearSuggestions();
            SuccessToast('Successfully got current location!');
        },
        (err) => ErrorToast('Permission denied!'),
    );
};

export const calculateRoute = async ({
    pickupLocation,
    destination,
    setResult,
    setDistance,
    setDuration,
    setCalculating,
}: {
    pickupLocation: string;
    destination: string;
    setResult: React.Dispatch<
        React.SetStateAction<google.maps.DirectionsResult>
    >;
    setDistance: React.Dispatch<
        React.SetStateAction<{ text: string; value: number }>
    >;
    setDuration: React.Dispatch<
        React.SetStateAction<{ text: string; value: number }>
    >;
    setCalculating: React.Dispatch<
        React.SetStateAction<'idle' | 'error' | 'loading' | 'done'>
    >;
}) => {
    if (pickupLocation === '' && destination === '') {
        ErrorToast('Provide All Values');
        setCalculating(() => 'error');
        return;
    }

    try {
        const directionService = new google.maps.DirectionsService();

        const result = await directionService.route({
            origin: pickupLocation,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
        });
        if (result) setResult(() => result);

        setDistance(() => ({
            text: result.routes[0].legs[0].distance?.text as string,
            value: result.routes[0].legs[0].distance?.value as number,
        }));

        setDuration(() => ({
            text: result.routes[0].legs[0].duration?.text as string,
            value: result.routes[0].legs[0].duration?.value as number,
        }));

        setCalculating(() => 'done');
        SuccessToast('Found Cab');
    } catch (error) {
        setCalculating(() => 'error');
        ErrorToast('Error Founding Cab');
    }
};

export const calculateFare = ({
    perKm,
    distance,
    time,
}: {
    perKm: number;
    distance: number;
    time: string;
}) => {
    let amount = distance * perKm * 0.001;
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 20 || hour < 6) {
        amount += amount * 0.2;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
    }).format(Math.round(amount));
};

export const calculateDropOff = (seconds: number) => {
    const now = new Date();
    const dropOff = new Date(now.setSeconds(now.getSeconds() + seconds));
    return dropOff.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
};
