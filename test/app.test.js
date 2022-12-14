var assert = require("chai").assert;
var rewire = require("rewire");
const { expect } = require('chai');
const chai = require('chai');
const { JSDOM } = require('jsdom');
chai.use(require('chai-dom'));
require('jsdom-global')();
const fetchMock = require('fetch-mock');

//TODO: find a way to retrieve these Jsons from files
const names1Json = '[{"name": "Armand Hammer"}]'
const names3Json = '[{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"}]'
const names5Json = '[{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"}]'
const names10Json = '[{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"}]'
const names30Json = '[{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"},{"name": "Armand Hammer"},{"name": "Doug Graves"},{"name": "Tamara Knight"}]'


describe('Main page test', () => {
    beforeEach((done) => {
        JSDOM.fromFile('index.html')
            .then((dom) => {
                global.document = dom.window.document
            })
            .then(done, done);
    })

    afterEach(() => {
        delete require.cache[require.resolve('../src/app')];
    });

    before(function () {
        fetchMock.get('https://random-data-api.com/api/name/random_name?size=1', names1Json);
        fetchMock.get('https://random-data-api.com/api/name/random_name?size=3', names3Json);
        fetchMock.get('https://random-data-api.com/api/name/random_name?size=5', names5Json);
        fetchMock.get('https://random-data-api.com/api/name/random_name?size=10', names10Json);
        fetchMock.get('https://random-data-api.com/api/name/random_name?size=30', names30Json);
    });

    after(function () {
        fetchMock.restore();
    });

    describe("Ok button tests", () => {
        it("Ok button is disabled by default", () => {
            let app = require("../src/app");
            let studentsOkButton = document.getElementById('studentsButton')
            assert.isTrue(studentsOkButton.disabled)
        });

        it("Ok button is enabled when entering 1 student", () => {
            let app = require("../src/app")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = '1';

            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)

            let studentsButton = document.getElementById('studentsButton');
            assert.isFalse(studentsButton.disabled)
        });

        it("Ok button is enabled when entering 30 students", () => {
            let app = require("../src/app")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = '30';

            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)

            let studentsButton = document.getElementById('studentsButton');
            assert.isFalse(studentsButton.disabled)
        });

        it("Ok button is disabled when entering a number lower than 1", () => {
            let app = require("../src/app")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = '0';

            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)

            let studentsButton = document.getElementById('studentsButton');
            assert.isTrue(studentsButton.disabled)
        });

        it("Ok button is disabled when entering a number greater than 30", () => {
            let app = require("../src/app")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = '31';

            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)

            let studentsButton = document.getElementById('studentsButton');
            assert.isTrue(studentsButton.disabled)
        });
    })

    describe("Students table tests", () => {

        it("Only 1 row by default", () => {
            let app = require("../src/app")
            let studentsTable = document.getElementById("studentsTable")

            assert.equal(studentsTable.rows.length, 1)
        })

        it("Number input + 1 (header) is equal to number of rows", async function () {
            let app = require("../src/app")
            let studentsTable = document.getElementById("studentsTable")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = 3
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)
            let studentsButton = document.getElementById('studentsButton');
            studentsButton.click()

            //TODO: find a more elegant way to ensure promise is executed
            await wait(1000);

            assert.equal(studentsTable.rows.length, Number.parseInt(numberOfStudentsInput.value) + 1)
        })

        it("Check if the table cleans when entering a new number after another one ", async function () {
            let app = require("../src/app")
            let studentsTable = document.getElementById("studentsTable")
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput")
            numberOfStudentsInput.value = 5
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)
            let studentsButton = document.getElementById('studentsButton');
            studentsButton.click()

            //TODO: find a more elegant way to ensure promise is executed
            await wait(400);

            assert.equal(studentsTable.rows.length, Number.parseInt(numberOfStudentsInput.value) + 1)

            numberOfStudentsInput.value = 10
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched)
            studentsButton.click()

            //TODO: find a more elegant way to ensure promise is executed
            await wait(400)

            assert.equal(studentsTable.rows.length, Number.parseInt(numberOfStudentsInput.value) + 1)
        })

    })

    describe("Evaluate button tests", () => {
        it("Evaluate button 1 is disabled by default", () => {
            let app = require("../src/app");
            let evaluateButton1 = document.getElementById('evaluateButton1')
            assert.isTrue(evaluateButton1.disabled)
        });
        it("Evaluate button 2 is disabled by default", () => {
            let app = require("../src/app");
            let evaluateButton2 = document.getElementById('evaluateButton2')
            assert.isTrue(evaluateButton2.disabled)
        });
        it("Evaluate button 1 is enabled after clicking on OK", () => {
            let app = require("../src/app");
            let studentsOkButton = document.getElementById('studentsButton');

            var eventDispatched = studentsOkButton.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            let evaluateButton1 = document.getElementById('evaluateButton1');
            assert.isFalse(evaluateButton1.disabled)
        });
        it("Evaluate button 2 is enabled after clicking on OK", () => {
            let app = require("../src/app");
            let studentsOkButton = document.getElementById('studentsButton');

            var eventDispatched = studentsOkButton.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            let evaluateButton2 = document.getElementById('evaluateButton2');
            assert.isFalse(evaluateButton2.disabled)
        });

    })
    describe("Send button tests", () => {
        it("Send button is disabled by default", () => {
            let app = require("../src/app");
            let sendButton = document.getElementById('sendButton')
            assert.isTrue(sendButton.disabled)
        })
        it("Send button is enabled after clicking on Evaluate", () => {
            let app = require("../src/app");
            let evaluateButton1 = document.getElementById('evaluateButton1');

            var eventDispatched = evaluateButton1.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            let sendButton = document.getElementById('sendButton');
            assert.isFalse(sendButton.disabled)
        });
    })

    describe("Functionality of array", () => {
        it("Array is empty by default", () => {
            let app = rewire("../src/app");
            let students = app.__get__('students');
            assert.isTrue(students.length === 0);
        })
        it("Array completes after clicking OK", async function () {
            let app = rewire("../src/app");
            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput");

            numberOfStudentsInput.value = 5;
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched);

            let studentsOkButton = document.getElementById('studentsButton');
            var eventDispatched = studentsOkButton.dispatchEvent(new Event('click'));
            
            //TODO: find a more elegant way to ensure promise is executed
            await wait(400);
            assert.isTrue(eventDispatched);

            let students = app.__get__('students');
            assert.equal(students.length, Number.parseInt(numberOfStudentsInput.value));
        })
        it("Id and name are not null", async function() {
            let app = rewire("../src/app");

            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput");
            numberOfStudentsInput.value = 5;
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched);

            let studentsOkButton = document.getElementById('studentsButton');
            var eventDispatched = studentsOkButton.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            //TODO: find a more elegant way to ensure promise is executed
            await wait(400);

            let students = app.__get__('students');
            assert.isNotNull(students[0].id);
            assert.isNotNull(students[0].name);
            assert.isUndefined(students[0].score);
        })
        it("Score is not undefined after clicking on Evaluate", async function () {
            let app = rewire("../src/app");

            let numberOfStudentsInput = document.getElementById("numberOfStudentsInput");
            numberOfStudentsInput.value = 5;
            var eventDispatched = numberOfStudentsInput.dispatchEvent(new Event('input'))
            assert.isTrue(eventDispatched);

            let studentsOkButton = document.getElementById('studentsButton');
            var eventDispatched = studentsOkButton.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            //TODO: find a more elegant way to ensure promise is executed
            await wait(400);

            let evaluateButton1 = document.getElementById('evaluateButton1');

            var eventDispatched = evaluateButton1.dispatchEvent(new Event('click'))
            assert.isTrue(eventDispatched);

            let students = app.__get__('students');
            assert.isNotNull(students[0].id);
            assert.isNotNull(students[0].name);
            assert.typeOf(students[0].score, "number");
        })
    })
})

function wait(miliseconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, miliseconds);
    })
}