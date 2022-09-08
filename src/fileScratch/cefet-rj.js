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
        executablePath: executablePaths[platform]
    });

    return await browser.newPage();

}

const getSubjects = async (page) => {
    //Remove timeout because the page has a delay to answer to puppetear
    await page.setDefaultNavigationTimeout(0);

    await page.goto('http://www.cefet-rj.br/index.php/graduacao', {waitUntil: 'networkidle2'});

    //Get link to file and name of each subject
    const subjects = await page.evaluate(() => {
        var subjects = [];
        var liWithNoClass = Array.from(document.querySelectorAll("li:not([class])")); 
        var subjectLis = liWithNoClass.filter(x =>
            x.firstChild && x.firstChild.innerText &&
            ( x.firstChild.innerText.includes('Bacharelado em') || 
            x.firstChild.innerText.includes('Curso Superior de') ||
            x.firstChild.innerText.includes('Licenciatura em') )
        );

        var campus;
        var i = 0;
        subjectLis.forEach(x => {
            //TODO: automation of this part(visually calculated)
            //Get college branch of the subjects
            if (i <= 13) campus = 'Unidade Maracanã';
            if (i > 13 && i <= 16) campus = 'Unidade Angra dos Reis';
            if (i > 16 && i <= 18) campus = 'Unidade Itaguaí';
            if (i > 18 && i <= 22) campus = 'Unidade Nova Friburgo';
            if (i > 22 && i <= 25) campus = 'Unidade Nova Iguaçu';
            if (i > 25 && i <= 30) campus = 'Unidade Petrópolis';
            if (i > 30 && i <= 32) campus = 'Unidade Valença';
            if (i > 32 && i <= 34) campus = 'Educação a distância (EAD)'; 
        
            //Add subject obj to final array 
            subjects.push( { subjectName : `${campus}-${x.firstChild.innerText}`, subjectLink : x.firstChild.href } ); 
            i++;
        });
        return subjects;
    });

    for(var subject of subjects) {
        try{
            //Go to subject page
            await page.goto(subject.subjectLink, {waitUntil: 'networkidle2'});

            //Get link to subject curriculum file
            const curriculumLink = await page.evaluate(() => {
                var liWithNoClassNodeList = document.querySelectorAll("li:not([class])");
                var liWithNoClassArray = Array.from(liWithNoClassNodeList);
                
                var liWithDesiredContent = liWithNoClassArray.filter(
                    x => x.innerText.includes('Estrutura Curricular') ||
                    x.innerText.includes('Estrutura curricular') || 
                    x.innerText.includes('Grade Curricular') || 
                    x.innerText.includes('Grade curricular') ||
                    x.innerText.includes('Fluxograma')
                );
                var liWithChildren =  liWithDesiredContent.filter(x => x.children && x.children.length > 0);
                var lastLiWithDesiredContent =  liWithChildren[liWithChildren.length - 1];

                var subjectCurriculumLink = lastLiWithDesiredContent.children[lastLiWithDesiredContent.children.length - 1];
                return subjectCurriculumLink.href;
            });

            //get file extension(some files were jpegs and most part pdfs)
            var spltArray = curriculumLink.split('.');
            var extension = spltArray[spltArray.length - 1]

            //download file
            await downloadImage(curriculumLink, (__dirname + `../cefet/${subject.subjectName}.${extension}`) );

            //go back to initial page
            await page.goto('http://www.cefet-rj.br/index.php/graduacao', {waitUntil: 'networkidle2'});
        } catch(e){
            console.log(`erro: ${e},    materia: ${subject.subjectName}`)
        }
    }

    console.log('finished!')
    
}

async function downloadImage(url, dest) {
    const file = fs.createWriteStream(dest);

    await new Promise((resolve, reject) => {
        request({
            uri: url
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