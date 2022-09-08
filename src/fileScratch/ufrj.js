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

    await page.goto('https://siga.ufrj.br/sira/repositorio-curriculo/ListaCursos.html', { waitUntil: 'networkidle2' });

    //Get link to file and name of each subject
    var subjects = await page.evaluate(() => {
        var subjects = [];
        var columns = Array.from(document.getElementById("frameDynamic").contentDocument.querySelectorAll("tr.tableTitleBlue"));
        //first column is the header
        columns.splice(0, 1);

        columns.forEach(e => {
            //there are some colums without link
            if (e.children[1].children.length) {
                subjects.push({
                    subjectName: e.children[0].children[0].innerText,
                    subjectLink: e.children[1].children[e.children[1].children.length - 1].href.split("Ementa('")[1].slice(0, -2)
                });
            }
        });
        return subjects;
    });

    var data = [];
    for (var subject of subjects) {
        try {

            await page.goto("https://siga.ufrj.br/" + subject.subjectLink, { waitUntil: 'networkidle2' });

            //Get subject final array(ufrj lists the subject in the own page)
            var subjectData = await page.evaluate(() => {
                var json = [];
                var doc = document.getElementById("main").contentDocument.getElementById("frameDynamic").contentDocument
                
                //the coluns intercalete diferent stiles
                var columns1 = Array.from(doc.querySelectorAll(`tr.tableBodyBlue1`));
                var columns2 = Array.from(doc.querySelectorAll(`tr.tableBodyBlue2`));
                var columns = [...columns1, ...columns2];

                //the columns containing the subjects are the ones with two childrens and with a link
                var desiredColumns = columns.filter(e => e.children[0] && e.children[0].children[0] && e.children[0].children[0].href);

                desiredColumns.forEach(e => {
                    json.push({
                        code: e.children[0].children[0].innerText,
                        name: e.children[1].innerText,
                        semester: e.offsetParent.querySelectorAll('center')[0].innerText,
                        college: "UFRJ",
                        campus: "Fundão",
                    });
                });

                return json;
            });
            
            //standardizing with the other jsons
            subjectData.forEach(e => {
                e.course = subject.subjectName;
            });

            data = [...data, ...subjectData];
            
            //Go back to initial page
            await page.goto('https://siga.ufrj.br/sira/repositorio-curriculo/ListaCursos.html', { waitUntil: 'networkidle2' });
        } catch (e) {
            console.log(`erro: ${e},    materia: ${subject.subjectName}`)
        }
    }

    //write to final json file since there is no pdf reading(data is in the page)
    fs.writeFile(__dirname + "../json/ufrj", JSON.stringify(data) , function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

}

(async () => {
    const page = await loadWindow();
    await getSubjects(page);
})();


module.exports = app