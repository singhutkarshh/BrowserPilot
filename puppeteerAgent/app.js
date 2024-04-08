const puppeteer = require('puppeteer');
const generateSimplifiedDom = require('./generateSimplifiedDom');
const jsdom = require("jsdom");
const { getAnnotatedDOM } = require('./methods');
const createATemplate = require('./createTemplate');
const { determineNextAction } = require('./determineNextAction');
const { parseResponse } = require('./parseResponse');
const { callDOMAction } = require('./domActions');
const { delay } = require('./helpers');

// for user input
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));


const { JSDOM } = jsdom;

class Crawler {
    constructor() {
        this.page = null;
        this.browser = null;
        this.pageElementBuffer = {};
        this.actionHistory = [];
        this.lastInstruction = null;
        this.previousActions = [];
        this.currentElements = [];
    }

    async init() {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 1080 });
    }

    async goToPage(url) {
        await this.page.goto(url.includes("://") ? url : `https://${url}`);
    }

    async interactWithPage(objective) {
        await this.goToPage("https://www.google.com");

        await delay(5000);

        while (true) {
            let dom = await this.getDom();

            if (!dom) {
                console.log("No interactive elements found");
                break;
            }

            const currentDom = createATemplate(dom.outerHTML);
            // console.log("Parsed DOM: ", currentDom);

            let instruction;
            try {
                instruction = await determineNextAction(
                    objective,
                    this.previousActions,
                    currentDom,
                    3,
                    (error) => console.error(error)
                );
            } catch (error) {
                console.error('Error determining next action:', error);
                break;
            }


            let response = parseResponse(instruction.response);

            console.log("\n\n\n----------------------------Response from LLM -------------------------------- \n\n", response, "\n\n");

            if(response){
                console.log("BOT: ", response.thought);
                console.log("Action: ", response.parsedAction.name, "\n\n")
            }

            if (response === null || response.parsedAction.name === 'finish' || response.parsedAction.name === 'fail') break;

            // After parsing the action, if it's valid, add it to the previousActions array  
            if (response) {
                this.previousActions.push(response);
                await this.executeAction(response, currentDom);
            }
            if (response.parsedAction.name === 'finish' || response.parsedAction.name === 'fail') {
                console.log('BOT: ', response.thought, '\n\n Stopping further task  execution. \n\n');
                break;
            }
        }
    }

    async getDom() {
        let htmlContent = await this.page.content();
        const dom = new JSDOM(htmlContent);

        // Call getAnnotatedDOM to get a simplified version of the DOM  
        let simplifiedDomHtml = getAnnotatedDOM(dom.window, this.currentElements);

        // Parse the simplified HTML back into a DOM object  
        let simplifiedDom = new JSDOM(simplifiedDomHtml);
        const interactiveElements = [];

        const responseDom = generateSimplifiedDom(
            simplifiedDom.window.document.documentElement,
            interactiveElements,
            simplifiedDom.window
        );
        return responseDom;
    }

    async executeAction(action, currentDom) {
        let dom = new JSDOM(currentDom);
        try {
            if (action.parsedAction.name === 'click') {
                await callDOMAction('click', action.parsedAction.args, this.page, currentDom, this.currentElements);
            } else if (action.parsedAction.name === 'setValue') {
                await callDOMAction(
                    'setValue',
                    action?.parsedAction.args,
                    this.page,
                    dom.window.document.documentElement,
                    this.currentElements
                );
            } else if (action.parsedAction.name === 'navigate') {
                await callDOMAction(
                    'navigate',
                    action?.parsedAction.args,
                    this.page,
                    dom.window.document.documentElement,
                    this.currentElements
                );
            }
        } catch (error) {
            console.error('Error executing action:', error);
        }
    }

}

(async () => {
    let crawler = new Crawler();
    await crawler.init();

    let objective;
    objective = await prompt("Tell me what you want to do ;-)\n");
    await crawler.interactWithPage(objective);
})();  