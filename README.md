Context
========
We are building a method that will allow companies (plumbers, elevator workers, etc) to handle their interventions in their calendar. We already have classes for the intervention and we need to build a method that will allow us to calculate all the available windows.

Classes
========
The classes are provided but it is just an indication. You can freely implement your own classes if the wanted behavior is the same.

## Event

* An event is either an opening a or busy window. A busy window means that the company already has an intervention scheduled or cannot take an intervention this specific window.
* An opening event can be recurring, that means that it repeats itself every week.


Example
========
Here is what happens in the main.js file :

Let's take a company called "Plomberie FAURE", it put in the platform that it is usually available every week on Friday from 10:30 to 14:00. A resident has scheduled an intervention on Friday July 8th from 11:30 to 12:30 with it. Another resident wishes to know when the company is available from the 4th to the 10th of July. The answer should be that the company is available Friday, July 8th from 10:30 to 11:30 and from 12:30 to 14:00. For the test, we will assume that the algorithm returns an array with available windows/slots in the calendar, like described in the main.js file.

Evaluation Criteria
==========
We will particularly analyze the following criterias for the evaluation :
* The readability of the code (can we understand what you did easily)
* Tests !!!
* Performance
* The awesomeness of what you do

Details
=======
If there is no opening or a busy event for a certain window, that means the company is not available.