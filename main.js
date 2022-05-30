import Agenda from './agenda.js'

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



