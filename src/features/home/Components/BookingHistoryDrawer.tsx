import {
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Text,
} from '@chakra-ui/react';
import localforage from 'localforage';

import { useState, useEffect } from 'react';
import { bookingType } from 'Types';

const BookingHistoryDrawer = ({
    onClose,
    isOpen,
}: {
    onClose: () => void;
    isOpen: boolean;
}) => {
    const [bookingHistory, setBookingHistory] = useState<bookingType[]>([]);

    useEffect(() => {
        const getBooking = async () => {
            const currentBooking = (await localforage.getItem(
                'cab-booking',
            )) as unknown as bookingType[];

            if (currentBooking !== bookingHistory) {
                setBookingHistory(currentBooking);
            }
        };

        getBooking();

        window.addEventListener('storage', getBooking);

        return () => {
            window.removeEventListener('storage', getBooking);
        };
    }, [bookingHistory]);

    return (
        <>
            <Drawer onClose={onClose} isOpen={isOpen} size="lg">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader textAlign="center" fontWeight="semibold">
                        Booking History
                    </DrawerHeader>
                    <DrawerBody>
                        {bookingHistory?.length > 0 &&
                            bookingHistory.map((booking) => (
                                <Box
                                    borderColor="rgb(228,228,228)"
                                    borderWidth="2px"
                                    borderRadius="md"
                                    px="5"
                                    py="2"
                                    mb="3"
                                >
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Date :{' '}
                                        </Text>
                                        {booking.Dated}
                                    </Text>
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Pickup :{' '}
                                        </Text>
                                        {booking.Pickup}
                                    </Text>
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Destination :{' '}
                                        </Text>
                                        {booking.Destination}
                                    </Text>
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Distance :{' '}
                                        </Text>
                                        {booking.Distance}
                                    </Text>
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Duration :{' '}
                                        </Text>
                                        {booking['Trip Duration']}
                                    </Text>
                                    <Text className="tracking-overflow">
                                        <Text
                                            as="span"
                                            textColor="black"
                                            fontWeight="bold"
                                        >
                                            Trip Fare :{' '}
                                        </Text>
                                        {booking['Trip Fare']}
                                    </Text>
                                </Box>
                            ))}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default BookingHistoryDrawer;
