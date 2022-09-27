import { useRef, useState, useEffect } from 'react';

import {
    Box,
    IconButton,
    Text,
    Image,
    InputGroup,
    InputRightElement,
    Icon,
    InputLeftElement,
    Input,
    Button,
    useDisclosure,
    Tooltip,
} from '@chakra-ui/react';

import {
    AutoComplete,
    AutoCompleteInput,
    AutoCompleteList,
    AutoCompleteItem,
} from '@choc-ui/chakra-autocomplete';

import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

import {
    calculateRoute,
    getCurrentLocation,
    calculateFare,
    calculateDropOff,
} from 'Utils/route';

import usePlacesAutocomplete from 'use-places-autocomplete';

import { HiLocationMarker } from 'react-icons/hi';
import { AiOutlineAim } from 'react-icons/ai';
import { MdHistory } from 'react-icons/md';

import ErrorToast from 'Utils/Toast/Error';
import SuccessToast from 'Utils/Toast/Success';
import { exampleMapStyles } from 'Utils/mapStyles';
import { cabs } from 'Utils/cabs';

import { bookingType, cabType } from 'Types';

import localforage from 'localforage';
import { BookingHistoryDrawer } from 'features';

const Home = () => {
    const [pickupLocation, setPickupLocation] = useState<string>('');
    const pickupRef = useRef<HTMLInputElement | null>(null);
    const [destination, setDestination] = useState<string>('');
    const [pickupTime, setPickupTime] = useState('');
    const [result, setResult] = useState<google.maps.DirectionsResult | null>(
        null,
    );
    const [distance, setDistance] = useState<{ text: string; value: number }>({
        text: '',
        value: 0,
    });
    const [duration, setDuration] = useState<{ text: string; value: number }>({
        text: '',
        value: 0,
    });
    const [calculating, setCalculating] = useState<
        'idle' | 'error' | 'loading' | 'done'
    >('idle');
    const [bookingCabStatus, setBookingCabStatus] = useState<
        'loading' | 'done' | 'idle'
    >('idle');
    const [currrentCab, setCurrentCab] = useState<
        'mini' | 'sedan' | 'prime' | 'suv'
    >('mini');

    const { isOpen, onOpen, onClose } = useDisclosure();

    const searchCab = async () => {
        setCalculating(() => 'loading');

        if (!destination) {
            ErrorToast('Pickup Location Required!');
            setCalculating('error');
            return;
        }
        if (!pickupLocation) {
            ErrorToast('Destination Location Required!');
            setCalculating('error');
            return;
        }
        if (destination === pickupLocation) {
            ErrorToast('Pickup & Destination should not be same');
            setCalculating('error');
            return;
        }

        calculateRoute({
            destination,
            pickupLocation,
            setCalculating,
            setDistance,
            setDuration,
            setResult: setResult as React.Dispatch<
                React.SetStateAction<google.maps.DirectionsResult>
            >,
        });
    };

    useEffect(() => {
        const getTime = setInterval(() => {
            let time = new Date();
            setPickupTime(
                `${
                    time.getHours().toString().length < 2
                        ? `0${time.getHours()}`
                        : time.getHours()
                }:${
                    time.getMinutes().toString().length < 2
                        ? `0${time.getMinutes()}`
                        : time.getMinutes()
                }`,
            );
        }, 60000);

        return () => {
            clearInterval(getTime);
        };
    }, []);

    const {
        setValue,
        suggestions: { data: allLocations },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: { componentRestrictions: { country: 'IN' } },
        debounce: 1000,
    });

    const selectCab = (id: 'mini' | 'sedan' | 'prime' | 'suv') => {
        if (id !== 'mini' && id !== 'prime' && id !== 'sedan' && id !== 'suv') {
            ErrorToast('Select A Valid Cab');
            return;
        }

        setCurrentCab(() => id);
    };

    const bookCab = async () => {
        setBookingCabStatus('loading');

        try {
            const currentCab: cabType | undefined = cabs.find(
                (cab) => cab.id === currrentCab,
            );
            if (!currentCab) return;

            const tripFare = calculateFare({
                perKm: currentCab.perKm ?? 10,
                distance: distance.value,
                time: pickupTime,
            });

            let currentBookings =
                ((await localforage.getItem(
                    'cab-booking',
                )) as unknown as bookingType[]) ?? [];

            currentBookings = [
                ...currentBookings,
                {
                    Dated: new Date().toDateString(),
                    Pickup: pickupLocation,
                    Destination: destination,
                    Distance: distance.text,
                    'Trip Duration': duration.text,
                    'Trip Fare': tripFare,
                },
            ];

            await localforage.setItem('cab-booking', currentBookings);

            SuccessToast('Booking SuccessFull');

            setBookingCabStatus('done');
        } catch (error) {
            ErrorToast('Failed to Book');
            setBookingCabStatus('idle');
        }
    };

    return (
        <>
            <Box
                margin="0px"
                display="flex"
                flex="1 1 0%"
                flexDirection={{ base: 'column', md: 'row' }}
                width="100%"
            >
                <Box pos="relative" bg="white" w="full">
                    <GoogleMap
                        zoom={15}
                        options={{
                            zoomControl: true,
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                            styles: exampleMapStyles,
                            scrollwheel: true,
                            disableDoubleClickZoom: true,
                        }}
                        mapContainerClassName="w-full h-full"
                        center={{ lat: 23.331929, lng: 85.362087 }}
                    >
                        {result && (
                            <DirectionsRenderer
                                directions={result}
                                options={{
                                    polylineOptions: {
                                        strokeColor: '#313641',
                                        strokeWeight: 4,
                                    },
                                }}
                            />
                        )}
                    </GoogleMap>
                </Box>

                <Box
                    as="div"
                    display="flex"
                    flexDir="column"
                    bg="white"
                    w={{
                        base: 'full',
                        md: 'container.md',
                    }}
                >
                    <Box
                        bg="white"
                        px="5"
                        pt="5"
                        display={{ base: 'unset', md: 'block' }}
                    >
                        <Box pos={'relative'} display={'flex'}>
                            <Tooltip label="Booking History">
                                <IconButton
                                    onClick={onOpen}
                                    aria-label="Open Side Bar"
                                    icon={<MdHistory fontSize="1.5rem" />}
                                />
                            </Tooltip>

                            <Text
                                as="h5"
                                textAlign="center"
                                fontWeight="700"
                                fontSize="1.5rem"
                                width="100%"
                                lineHeight="1.5"
                            >
                                Cab-Fare
                            </Text>
                        </Box>

                        <Box
                            pb="5"
                            borderBottom="1px"
                            borderColor="rgb(200,200,200)"
                            display="flex"
                            flexDir="column"
                            gap="0.9rem"
                            marginTop="1.5rem"
                        >
                            <AutoComplete
                                rollNavigation
                                onChange={(vals) => {
                                    setPickupLocation(vals);
                                    clearSuggestions();
                                    pickupRef.current &&
                                        (pickupRef.current.value = vals);
                                }}
                            >
                                <InputGroup>
                                    <AutoCompleteInput
                                        variant="outline"
                                        placeholder="Select Pickup Location"
                                        autoFocus
                                        ref={pickupRef}
                                        onChange={(event) =>
                                            setValue(event.target.value)
                                        }
                                    />
                                    <InputLeftElement
                                        fontSize="1.2rem"
                                        children={
                                            <Icon as={HiLocationMarker} />
                                        }
                                    />
                                    <InputRightElement
                                        fontSize="1.2rem"
                                        cursor="pointer"
                                        onClick={() =>
                                            getCurrentLocation({
                                                pickupRef,
                                                setPickupLocation,
                                                clearSuggestions,
                                            })
                                        }
                                        children={<Icon as={AiOutlineAim} />}
                                    />
                                </InputGroup>

                                <AutoCompleteList>
                                    {allLocations.map((option, key) => (
                                        <AutoCompleteItem
                                            key={`location//${key}`}
                                            value={option.description}
                                            label={option.description}
                                            textTransform="capitalize"
                                        >
                                            {option.description}
                                        </AutoCompleteItem>
                                    ))}
                                </AutoCompleteList>
                            </AutoComplete>

                            <AutoComplete
                                rollNavigation
                                onChange={(vals) => {
                                    setDestination(vals);
                                    clearSuggestions();
                                }}
                            >
                                <InputGroup>
                                    <AutoCompleteInput
                                        variant="outline"
                                        placeholder="Select Destination..."
                                        autoFocus
                                        onChange={(event) =>
                                            setValue(event.target.value)
                                        }
                                    />
                                    <InputLeftElement
                                        fontSize="1.2rem"
                                        children={
                                            <Icon as={HiLocationMarker} />
                                        }
                                    />
                                </InputGroup>

                                <AutoCompleteList>
                                    {allLocations.map((option, key) => (
                                        <AutoCompleteItem
                                            key={`location//${key}`}
                                            value={option.description}
                                            label={option.description}
                                            textTransform="capitalize"
                                        >
                                            {option.description}
                                        </AutoCompleteItem>
                                    ))}
                                </AutoCompleteList>
                            </AutoComplete>

                            <Input
                                placeholder="Select Date and Time"
                                size="md"
                                type="time"
                                value={pickupTime}
                                onChange={(event) =>
                                    setPickupTime(event.target.value)
                                }
                                flexDir="row-reverse"
                                p="0"
                                gap="0.5rem"
                            />

                            {calculating === 'loading' ? (
                                <>
                                    <Button
                                        isLoading
                                        loadingText="Submitting"
                                        colorScheme="teal"
                                        variant="outline"
                                        fontSize={{
                                            ssm: '1rem ',
                                            sm: '0.96rem',
                                        }}
                                        fontWeight={600}
                                        color="white"
                                        bg="main.blue"
                                        _active={{}}
                                        _hover={{}}
                                        minWidth="11.8rem"
                                    >
                                        Searching...
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    bg="blue.500"
                                    _hover={{ backgroundColor: 'blue.300' }}
                                    textColor="white"
                                    fontWeight="700"
                                    fontSize="1.1rem"
                                    onClick={searchCab}
                                >
                                    Search Cab
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {calculating === 'done' && (
                        <Box
                            px={{ base: 3, sm: 6 }}
                            pt="5"
                            pb="8"
                            overflow="auto"
                        >
                            <Text
                                fontSize={{ base: 'sm', sm: 'lg' }}
                                mb={{ base: '4', md: '6' }}
                                fontWeight="medium"
                            >
                                Distance: {distance.text}
                            </Text>
                            <Text
                                fontSize={{ base: 'sm', sm: 'lg' }}
                                mb={{ base: '4', md: '6' }}
                                fontWeight="medium"
                            >
                                Duration: {duration.text}
                            </Text>
                            <Text
                                fontSize={{ base: 'sm', sm: 'lg' }}
                                mb="6"
                                fontWeight="medium"
                                borderBottom="2px"
                                pb="2"
                                textColor="gray.500"
                            >
                                Ride Fare
                            </Text>

                            <Box display="flex" flexDir="column" rowGap="3">
                                {cabs.map((cab) => (
                                    <Box
                                        key={cab.id}
                                        px={{ base: '2', sm: '4' }}
                                        display="flex"
                                        py="4"
                                        rowGap={{ base: '4', md: '5' }}
                                        alignItems="center"
                                        borderRadius="sm"
                                        borderColor={`${
                                            cab.id === currrentCab
                                                ? '#3182ce'
                                                : 'rgb(228,228,228)'
                                        }`}
                                        borderWidth="2px"
                                        rounded="md"
                                        w="full"
                                        cursor="pointer"
                                        onClick={() => selectCab(cab.id)}
                                    >
                                        <Image
                                            w="16"
                                            src={`/images/${cab.image}.png`}
                                            mr="0.7rem"
                                        />
                                        <Box flexGrow="1" minW="0">
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                mb="1"
                                            >
                                                <Text
                                                    as="h5"
                                                    fontSize={{
                                                        base: '1rem',
                                                        sm: '1.1rem',
                                                    }}
                                                    fontWeight="semibold"
                                                    letterSpacing="wide"
                                                    textOverflow="ellipsis"
                                                    whiteSpace="nowrap"
                                                    overflow="hidden"
                                                >
                                                    {cab.title}
                                                </Text>
                                                <Text
                                                    as="h5"
                                                    fontSize={{
                                                        base: '1rem',
                                                        sm: '1.1rem',
                                                    }}
                                                    fontWeight="semibold"
                                                    letterSpacing="wide"
                                                >
                                                    {calculateFare({
                                                        perKm: cab.perKm ?? 10,
                                                        distance:
                                                            distance.value,
                                                        time: pickupTime,
                                                    })}
                                                </Text>
                                            </Box>
                                            <Box
                                                fontSize="sm"
                                                mb="1"
                                                textColor="gray.500"
                                            >
                                                {cab.description}
                                            </Box>
                                            <Box
                                                fontSize="sm"
                                                mb="1"
                                                textColor="gray.500"
                                            >
                                                {calculateDropOff(
                                                    duration.value,
                                                )}{' '}
                                                dropoff
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box marginTop="1.25rem">
                                {bookingCabStatus === 'loading' ? (
                                    <>
                                        <Button
                                            isLoading
                                            loadingText="Submitting"
                                            colorScheme="teal"
                                            variant="outline"
                                            fontSize={{
                                                ssm: '1rem ',
                                                sm: '0.96rem',
                                            }}
                                            fontWeight={600}
                                            color="white"
                                            bg="main.blue"
                                            _active={{}}
                                            _hover={{}}
                                            minWidth="11.8rem"
                                            width="100%"
                                        >
                                            Booking...
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        bg="blue.500"
                                        _hover={{ backgroundColor: 'blue.300' }}
                                        textColor="white"
                                        fontWeight="700"
                                        fontSize="1.1rem"
                                        minWidth="11.8rem"
                                        width="100%"
                                        onClick={bookCab}
                                    >
                                        Book Cab
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>

                <BookingHistoryDrawer isOpen={isOpen} onClose={onClose} />
            </Box>
        </>
    );
};

export default Home;
