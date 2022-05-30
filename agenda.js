let Agenda = function () {
    this.eventList = [];
};

Agenda.prototype.addEvent = function (opening, recurring, startDate, endDate) {
    let event = {}

    event.opening = opening;
    event.recurring = recurring;
    event.startDate = startDate;
    event.endDate = endDate;

    this.eventList.push(event);
};

Agenda.prototype.getOverlapInterval = function (slot, referenceSlot) {
    if (this.areRangesOverlaping(slot, referenceSlot)) {
        return {
            startTime: slot.startTime > referenceSlot.startTime ? slot.startTime : referenceSlot.startTime,
            endTime: slot.endTime > referenceSlot.endTime ? referenceSlot.endTime : slot.endTime,
        }
    } else {
        return null
    }
};

Agenda.prototype.isTimeInRange = function (time, range) {
    return time >= range.startTime && time <= range.endTime;
}

Agenda.prototype.areRangesOverlaping = function (range1, range2) {
    return (this.isTimeInRange(range1.startTime, range2) ||
        this.isTimeInRange(range1.endTime, range2) ||
        this.isTimeInRange(range2.startTime, range1) ||
        this.isTimeInRange(range2.endTime, range1))
};

Agenda.prototype.convertTimeRangeToDateRange = function (availabilityList) {
    return availabilityList.map(slot => {
        return {
            startDate: new Date(slot.startTime),
            endDate: new Date(slot.endTime)
        }
    })
};

Agenda.prototype.excludeRangeFromRange = function (rangeToExclude, referenceRange) {
    let intersectionList = [];

    if (this.isTimeInRange(rangeToExclude.startTime, referenceRange)) {
        intersectionList.push({startTime: referenceRange.startTime, endTime: rangeToExclude.startTime});
    }
    if (this.isTimeInRange(rangeToExclude.endTime, referenceRange)) {
        intersectionList.push({startTime: rangeToExclude.endTime, endTime: referenceRange.endTime});
    }

    return intersectionList.length ? intersectionList : [referenceRange];
};

Agenda.prototype.getAllIterationOfRecurringSlotInRange = function (initialRecurringSlotList, [rangeStartTime, rangeEndTime]) {
    return initialRecurringSlotList.reduce((slotList, slot) => {
        // First we calculate every weekly iteration of the recurring slot in the given range
        const weekMilliseconds = 604800000;

        // We calculate the min and max boundaries (number of weeks offset to reach the given range from the initial recurring slot) of iterations in the given range
        const iterationsBoundariesInRange = [
            Math.floor((rangeStartTime - slot.startTime) / weekMilliseconds),
            Math.floor((rangeStartTime - slot.endTime) / weekMilliseconds),
            Math.floor((rangeEndTime - slot.startTime) / weekMilliseconds),
            Math.floor((rangeEndTime - slot.endTime) / weekMilliseconds),
        ];

        // Then we calculate the overlaping interval of each iteration with the given range
        // Theorically, it only concerns first and last iteration, but a for loop works in every configuration.
        for (let i = Math.min(...iterationsBoundariesInRange); i <= Math.max(...iterationsBoundariesInRange); i++) {
            let overlappingSlot = this.getOverlapInterval(
                {
                    startTime: slot.startTime + (i * weekMilliseconds),
                    endTime: slot.endTime + (i * weekMilliseconds),
                },
                {
                    startTime: rangeStartTime,
                    endTime: rangeEndTime,
                }
            )

            if (overlappingSlot) slotList.push(overlappingSlot);
        }

        return slotList;
    }, []);
};

Agenda.prototype.getAvailabilities = function (rangeStartDate, rangeEndDate) {
    //Converting range dates into timestamps
    const rangeStartTime = rangeStartDate.getTime(),
        rangeEndTime = rangeEndDate.getTime();

    //First, filtering non-recurring opening slots in the given range
    const uniqueOpenSlotList = this.eventList.filter(slot => {
        return slot.opening && !slot.recurring;
    }).map(slot => {
        return this.getOverlapInterval(
            {
                startTime: slot.startDate.getTime(),
                endTime: slot.endDate.getTime(),
            },
            {
                startTime: rangeStartTime,
                endTime: rangeEndTime,
            }
        )
    }).filter(slot => slot !== null);

    //Getting all recurring open slots in the event list
    const recurringOpenSlotList = this.eventList.filter(slot => {
            return slot.opening && slot.recurring;
        }
    ).map(slot => {
        return {
            startTime: slot.startDate.getTime(),
            endTime: slot.endDate.getTime(),
        }
    });

    //Then, getting all iterations of recurring opening slots in the given range
    const recurringOpenSlotInRangeList = this.getAllIterationOfRecurringSlotInRange(recurringOpenSlotList, [rangeStartTime, rangeEndTime]);

    //Same process with busy/closed slots, first unique ones
    const uniqueClosedSlotList = this.eventList.filter(slot => {
        return !slot.opening && !slot.recurring;
    }).map(slot => {
        return this.getOverlapInterval(
            {
                startTime: slot.startDate.getTime(),
                endTime: slot.endDate.getTime(),
            },
            {
                startTime: rangeStartTime,
                endTime: rangeEndTime,
            }
        )
    }).filter(slot => slot !== null);

    // Getting the reccuring busy slots
    const recurringClosedSlotList = this.eventList.filter(slot => {
            return !slot.opening && slot.recurring;
        }
    ).map(slot => {
        return {
            startTime: slot.startDate.getTime(),
            endTime: slot.endDate.getTime(),
        }
    });

    //And then filtering iteration of reccuring busy slots in given range
    const recurringClosedSlotInRangeList = this.getAllIterationOfRecurringSlotInRange(recurringClosedSlotList, [rangeStartTime, rangeEndTime]);

    //Merging and sorting (by startTime) all open slots in range
    let allOpenSlotsInRangeList = [...uniqueOpenSlotList, ...recurringOpenSlotInRangeList].sort((a, b) => {
        return a.startTime - b.startTime;
    });

    //Same with busy slots
    let allClosedSlotsInRangeList = [...uniqueClosedSlotList, ...recurringClosedSlotInRangeList].sort((a, b) => {
        return a.startTime - b.startTime;
    });

    //If there is no busy slots, return all open slots
    if (!allClosedSlotsInRangeList.length) return this.convertTimeRangeToDateRange(allOpenSlotsInRangeList);

    // We exclude busy slots from every open slots that overlaps, we use while because allOpenSlotInRangeList is dynamic
    let i = 0;
    while (i < allOpenSlotsInRangeList.length) {
        allClosedSlotsInRangeList.forEach(closedSlot => {
            let remainingOpenSlots = this.excludeRangeFromRange(closedSlot, allOpenSlotsInRangeList[i]);

            //We re-inject remaining slot after excluding back into the list in order to apply other busy slot into them if needed
            allOpenSlotsInRangeList.splice(i, 1, ...remainingOpenSlots)
        })
        i++
    }

    // Final filtering on void ranges (with same start and end time)
    const availabilities = allOpenSlotsInRangeList.filter(slot => slot.startTime !== slot.endTime);

    return this.convertTimeRangeToDateRange(availabilities);
};

export default Agenda
