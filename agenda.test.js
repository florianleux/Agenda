import Agenda from './agenda.js'

describe('Testing object methods', () => {
    test('Initializing agenda', () => {
        let agenda = new Agenda();

        expect(agenda.eventList).toEqual([]);
    });

    test('Adding event', () => {
        let agenda = new Agenda();

        let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
            slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

        agenda.addEvent(true, false, slotStartDate, slotEndDate);

        expect(agenda.eventList).toStrictEqual([
            {
                opening: true,
                recurring: false,
                startDate: new Date(Date.UTC(2022, 6, 2, 8, 0)),
                endDate: new Date(Date.UTC(2022, 6, 2, 18, 0))
            }
        ])
    });

    test('Checking if given time is in given interval', () => {
        let agenda = new Agenda(),
            interval = {
                startTime: Date.UTC(2022, 6, 2, 8, 0),
                endTime: Date.UTC(2022, 6, 2, 18, 0)
            },
            time1 = Date.UTC(2023, 6, 2, 8, 0),
            time2 = Date.UTC(2022, 6, 2, 10, 0);

        expect(agenda.isTimeInRange(time1, interval)).toBeFalsy();
        expect(agenda.isTimeInRange(time2, interval)).toBeTruthy();
    });

    describe('Intervals overlapping', () => {
        test('No overlap between intervals', () => {
            let agenda = new Agenda(),
                interval1 = {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
                interval2 = {
                    startTime: Date.UTC(2022, 6, 3, 8, 0),
                    endTime: Date.UTC(2022, 6, 3, 18, 0)
                };

            expect(agenda.areRangesOverlaping(interval1, interval2)).toBeFalsy();
            expect(agenda.getOverlapInterval(interval1, interval2)).toBeNull();
        });

        test('One interval overlap', () => {
            let agenda = new Agenda(),
                interval1 = {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
                interval2 = {
                    startTime: Date.UTC(2022, 6, 2, 14, 0),
                    endTime: Date.UTC(2022, 6, 3, 18, 0)
                };

            expect(agenda.areRangesOverlaping(interval1, interval2)).toBeTruthy();

            expect(agenda.getOverlapInterval(interval1, interval2)).toStrictEqual({
                startTime: Date.UTC(2022, 6, 2, 14, 0),
                endTime: Date.UTC(2022, 6, 2, 18, 0)
            });
        });
    });

    test('Converting timestamps interval into dates interval', () => {
        let agenda = new Agenda(),
            interval = {
                startTime: Date.UTC(2022, 6, 2, 8, 0),
                endTime: Date.UTC(2022, 6, 2, 18, 0)
            };

        expect(agenda.convertTimeRangeToDateRange([interval])).toStrictEqual([{
            startDate: new Date(interval.startTime),
            endDate: new Date(interval.endTime)
        }])
    });

    describe('Excluding an interval from an other one', () => {
        test('Intervals dont overlap', () => {
            let agenda = new Agenda(),
                interval1 = {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
                interval2 = {
                    startTime: Date.UTC(2022, 6, 3, 8, 0),
                    endTime: Date.UTC(2022, 6, 3, 18, 0)
                };

            expect(agenda.excludeRangeFromRange(interval2, interval1)).toStrictEqual([interval1])

        });

        test('Intervals overlap side-by-side : exclusion produce only one interval', () => {
            let agenda = new Agenda(),
                interval1 = {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
                interval2 = {
                    startTime: Date.UTC(2022, 6, 2, 6, 0),
                    endTime: Date.UTC(2022, 6, 2, 12, 0)
                };

            expect(agenda.excludeRangeFromRange(interval2, interval1)).toStrictEqual([{
                startTime: Date.UTC(2022, 6, 2, 12, 0),
                endTime: Date.UTC(2022, 6, 2, 18, 0)
            }])
        });

        test('Intervals overlap in the middle : exclusion produce two intervals', () => {
            let agenda = new Agenda(),
                interval1 = {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
                interval2 = {
                    startTime: Date.UTC(2022, 6, 2, 9, 30),
                    endTime: Date.UTC(2022, 6, 2, 11, 30)
                };

            expect(agenda.excludeRangeFromRange(interval2, interval1)).toStrictEqual([
                {
                    startTime: Date.UTC(2022, 6, 2, 8, 0),
                    endTime: Date.UTC(2022, 6, 2, 9, 30)
                },
                {
                    startTime: Date.UTC(2022, 6, 2, 11, 30),
                    endTime: Date.UTC(2022, 6, 2, 18, 0)
                },
            ]);
        });
    });

    describe('Getting iteration of a reccuring slot in a given range', () => {
        test('Given range does not overlap with an iteration', () => {
            let agenda = new Agenda(),
                recurringInterval1 = {
                    startTime: Date.UTC(2022, 5, 2, 8, 0),
                    endTime: Date.UTC(2022, 5, 2, 12, 0)
                },
                referenceRange = [
                    Date.UTC(2022, 5, 4, 8, 0),
                    Date.UTC(2022, 5, 4, 12, 0)
                ];

            expect(agenda.getAllIterationOfRecurringSlotInRange([recurringInterval1], referenceRange)).toStrictEqual([])

        });

        test('Given range overlaps with an iteration of a recurring,slot set in the future', () => {
            let agenda = new Agenda(),
                recurringInterval1 = {
                    startTime: Date.UTC(2022, 5, 15, 8, 0),
                    endTime: Date.UTC(2022, 5, 15, 12, 0)
                },
                referenceRange = [
                    Date.UTC(2022, 5, 8, 6, 0),
                    Date.UTC(2022, 5, 8, 16, 0)
                ];

            expect(agenda.getAllIterationOfRecurringSlotInRange([recurringInterval1], referenceRange)).toStrictEqual([
                {
                    startTime: Date.UTC(2022, 5, 8, 8, 0),
                    endTime: Date.UTC(2022, 5, 8, 12, 0)
                }
            ]);
        });

        test('Given range overlaps with an iteration of a recurring, slot set in the past', () => {
            let agenda = new Agenda(),
                recurringInterval1 = {
                    startTime: Date.UTC(2022, 3, 7, 8, 0),
                    endTime: Date.UTC(2022, 3, 7, 9, 30)
                },
                referenceRange = [
                    Date.UTC(2022, 5, 9, 6, 0),
                    Date.UTC(2022, 5, 9, 16, 0)
                ];

            expect(agenda.getAllIterationOfRecurringSlotInRange([recurringInterval1], referenceRange)).toStrictEqual([
                {
                    startTime: Date.UTC(2022, 5, 9, 8, 0),
                    endTime: Date.UTC(2022, 5, 9, 9, 30)
                }
            ]);
        });

        test('Given range overlaps with several iterations of several slots', () => {
            let agenda = new Agenda(),
                recurringInterval1 = {
                    startTime: Date.UTC(2022, 3, 7, 8, 0),
                    endTime: Date.UTC(2022, 3, 7, 9, 30)
                },
                recurringInterval2 = {
                    startTime: Date.UTC(2022, 9, 21, 18, 0),
                    endTime: Date.UTC(2022, 9, 21, 19, 45)
                },
                referenceRange = [
                    Date.UTC(2022, 5, 6, 6, 0),
                    Date.UTC(2022, 5, 18, 16, 0)
                ];

            expect(agenda.getAllIterationOfRecurringSlotInRange([recurringInterval1, recurringInterval2], referenceRange)).toStrictEqual([
                {
                    startTime: Date.UTC(2022, 5, 9, 8, 0),
                    endTime: Date.UTC(2022, 5, 9, 9, 30)
                },

                {
                    startTime: Date.UTC(2022, 5, 16, 8, 0),
                    endTime: Date.UTC(2022, 5, 16, 9, 30)
                },
                {
                    startTime: Date.UTC(2022, 5, 10, 18, 0),
                    endTime: Date.UTC(2022, 5, 10, 19, 45)
                },
                {
                    startTime: Date.UTC(2022, 5, 17, 18, 0),
                    endTime: Date.UTC(2022, 5, 17, 19, 45)
                },
            ]);
        });
    })
});

describe('Testing getAvailabilities()', () => {
    describe('Only open slots in range', () => {
        test('Unique open slot in range', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 1, 10, 0));
            let toDate = new Date(Date.UTC(2022, 6, 3, 10, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual(
                [
                    {
                        startDate: new Date(Date.UTC(2022, 6, 2, 8, 0)),
                        endDate: new Date(Date.UTC(2022, 6, 2, 18, 0))
                    }
                ]
            );
        });

        test('Recurring opening slot iteration in range', () => {
            let agenda = new Agenda()

            let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 9, 9, 0));
            let toDate = new Date(Date.UTC(2022, 6, 9, 13, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 9, 9, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 9, 13, 0))
                }
            ]);
        });

        test('Recurring and unique opening slot iteration in range', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 8, 9, 30));
            slotEndDate = new Date(Date.UTC(2022, 6, 8, 12, 45));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 8, 11, 0));
            let toDate = new Date(Date.UTC(2022, 6, 10, 13, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);


            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 11, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 12, 45))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 9, 8, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 9, 18, 0))
                },
            ]);
        });
    });

    describe('No open slots in range', () => {
        test('No slot at all in range', () => {
            let agenda = new Agenda();

            let fromDate = new Date(Date.UTC(2022, 8, 1, 10, 0));
            let toDate = new Date(Date.UTC(2022, 8, 3, 10, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual([]);
        })

        test('Only busy slot in range', () => {
            let agenda = new Agenda()

            let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 8, 1, 10, 0));
            let toDate = new Date(Date.UTC(2022, 8, 3, 10, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual([]);
        });


    });

    describe('Both busy and open slots in range', () => {
        test('Unique Non-overlaping  open and busy slots in range', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 8, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 8, 12, 0));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 8, 14, 0));
            slotEndDate = new Date(Date.UTC(2022, 6, 8, 18, 5));

            agenda.addEvent(false, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 8, 9, 0));
            let toDate = new Date(Date.UTC(2022, 6, 10, 17, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);


            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 9, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 12, 0))
                },
            ]);

        })

        test('Overlaping unique open and busy slots in range', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 8, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 8, 18, 0));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 8, 9, 30));
            slotEndDate = new Date(Date.UTC(2022, 6, 8, 12, 45));

            agenda.addEvent(false, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 6, 11, 0));
            let toDate = new Date(Date.UTC(2022, 6, 10, 13, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);


            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 8, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 9, 30))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 12, 45)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 18, 0))
                },
            ]);
        });

        test('Overlaping recurring open and busy slots iteration in range', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 15, 6, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 15, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 1, 9, 30));
            slotEndDate = new Date(Date.UTC(2022, 6, 1, 13, 45));

            agenda.addEvent(false, true, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 8, 0, 0));
            let toDate = new Date(Date.UTC(2022, 6, 8, 17, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);


            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 6, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 9, 30))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 13, 45)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 17, 0))
                },
            ]);
        });

        test('Busy slot overlaping one unique and one iteration of open slots', () => {
            let agenda = new Agenda();

            let slotStartDate = new Date(Date.UTC(2022, 6, 2, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 2, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 8, 9, 30));
            slotEndDate = new Date(Date.UTC(2022, 6, 8, 12, 45));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 8, 11, 30));
            slotEndDate = new Date(Date.UTC(2022, 6, 9, 12, 45));

            agenda.addEvent(false, false, slotStartDate, slotEndDate);

            let fromDate = new Date(Date.UTC(2022, 6, 7, 11, 0));
            let toDate = new Date(Date.UTC(2022, 6, 11, 13, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 8, 9, 30)),
                    endDate: new Date(Date.UTC(2022, 6, 8, 11, 30))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 9, 12, 45)),
                    endDate: new Date(Date.UTC(2022, 6, 9, 18, 0))
                },
            ]);
        });

        test('Big mix of every type of slots within range', () => {
            let agenda = new Agenda();

            //Open Slots

            let slotStartDate = new Date(Date.UTC(2022, 6, 4, 8, 0)),
                slotEndDate = new Date(Date.UTC(2022, 6, 4, 18, 0));

            agenda.addEvent(true, false, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 12, 8, 0));
            slotEndDate = new Date(Date.UTC(2022, 6, 12, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 5, 29, 8, 0));
            slotEndDate = new Date(Date.UTC(2022, 5, 29, 18, 0));

            agenda.addEvent(true, true, slotStartDate, slotEndDate);

            //Busy slots

            slotStartDate = new Date(Date.UTC(2022, 6, 4, 12, 0));
            slotEndDate = new Date(Date.UTC(2022, 6, 4, 17, 0));

            agenda.addEvent(false, false, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 6, 19, 12, 0));
            slotEndDate = new Date(Date.UTC(2022, 6, 19, 14, 0));

            agenda.addEvent(false, true, slotStartDate, slotEndDate);

            slotStartDate = new Date(Date.UTC(2022, 5, 22, 10, 0));
            slotEndDate = new Date(Date.UTC(2022, 5, 22, 17, 0));

            agenda.addEvent(false, true, slotStartDate, slotEndDate);


            //Given range
            let fromDate = new Date(Date.UTC(2022, 6, 4, 11, 0));
            let toDate = new Date(Date.UTC(2022, 6, 6, 15, 0));

            const availabilities = agenda.getAvailabilities(fromDate, toDate);

            expect(availabilities).toStrictEqual([
                {
                    startDate: new Date(Date.UTC(2022, 6, 4, 11, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 4, 12, 0))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 4, 17, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 4, 18, 0))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 5, 8, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 5, 12, 0))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 5, 14, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 5, 18, 0))
                },
                {
                    startDate: new Date(Date.UTC(2022, 6, 6, 8, 0)),
                    endDate: new Date(Date.UTC(2022, 6, 6, 10, 0))
                },
            ]);
        })

    });
});






