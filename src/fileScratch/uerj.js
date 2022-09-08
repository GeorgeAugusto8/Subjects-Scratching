const express = require('express')
const puppeteer = require('puppeteer-core');
const os = require('os');
const fs = require('fs');
const request = require('request');

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
        executablePath: executablePaths[platform],
        ignoreHTTPSErrors: true
    });

    return await browser.newPage();

}

const getSubjects = async (page) => {
    //Remove timeout because the page has a delay to answer to puppetear
    await page.setDefaultNavigationTimeout(0);

    await page.goto('http://www.dep.uerj.br/fluxogramas.html', {waitUntil: 'networkidle2'});

    //Get link to file and name of each subject
    const subjects = await page.evaluate(() => {
        var aElements = Array.from(document.querySelectorAll('a.nonblock') )
        var disiredAElements = aElements.filter(a => a.href.includes('fluxos'))
        var subjects = disiredAElements.map(e => { return {name: e.innerText, link: e.href} })
        return subjects;
    });


    for(var subject of subjects) {
        try{
            //replacing '/' to avoid folder creation
            if(subject.name.includes('/')) subject.name = subject.name.replace('/','-')
            //baixando imagem
            await downloadImage(subject.link, (__dirname + `../uerj/${subject.name}.pdf`) );

        } catch(e){
            console.log(`erro: ${e},    materia: ${subject.name}`)
        }
    }

    console.log('finished!')
    
}

async function downloadImage(url, dest) {
    const file = fs.createWriteStream(dest);

    await new Promise((resolve, reject) => {
        request({
            uri: url,
            rejectUnauthorized: false 
        })
        .pipe(file)
        .on('finish', async () => {
            console.log(`The file is finished downloading.`);
            resolve();
        })
        .on('error', (error) => {
            reject(error);
        });
    }).catch((error) => {
        console.log(`Something happened: ${error}`);
    });
}

(async () => {
    const page = await loadWindow();
    await getSubjects(page);
})();


module.exports = app