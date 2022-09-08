const express = require('express')
const puppeteer = require('puppeteer-core');
const os = require('os');
const fs = require('fs');

const app = express();

const executablePaths = {
    'linux': '/usr/bin/google-chrome',
    'darwin': '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'win32': 'C:\\Users\\georg\\Downloads\\chrome-win\\chrome'
};

const platform = os.platform();

const loadWindow = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: executablePaths[platform]
    });

    return await browser.newPage();

}

const getSubjects = async (page) => {
    //Remove timeout because the page has a delay to answer to puppetear
    await page.setDefaultNavigationTimeout(0);

    await page.goto('https://app.uff.br/iduff/consultaMatrizCurricular.uff', { waitUntil: 'networkidle2' });

    //Get link to file and name of each subject
    var options = await page.evaluate(async () => {
        var select = document.querySelector('select');
        var options = Array.from(select.options);
        options = options.map(e => e.value)
        return options;
    });

    //The uff page has a selector to choose the subject and a load button 
    for (var option of options) {
        await page.select('select', option);
        await page.evaluate(async () => {
            var button = document.querySelectorAll('input')[1];
            button.click();
        });
        
        //the page has a long answer time
        await page.waitForTimeout(5000);
    }

}

(async () => {
    const page = await loadWindow();
    await getSubjects(page);
})();


module.exports = app