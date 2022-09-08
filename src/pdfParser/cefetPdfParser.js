const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {};
const fs = require('fs');

/* 
arquivos que deu erro(provavelmente vale mais a pena fazer esses a mão) : 
-Unidade Maracanã-Bacharelado em Administração.jpg
-Unidade Maracanã-Bacharelado em Engenharia Elétrica.pdf
-Unidade Maracanã-Bacharelado em Física.pdf 
*/
const readData = async () => {
    var json = [];
    const files = fs.readdirSync(__dirname + `../cefet/`)
    for (var e of files) {
        try {
            var data = await pdfExtract.extract((__dirname + `../cefet/` + e), options);
            var content = extractContent(data.pages, e);
            json = [...json, ...content]
        } catch (err) {
            console.log(e)
        }
    }

    fs.writeFile(__dirname + "../json/cefet", JSON.stringify(json) , function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

const extractContent = (pages, filename) => {
    var data = [];
    var semesters = [];
    pages.forEach(page => {
        page.content.forEach((e, i) => {
            if (e.str.includes('PERÍODO')) {
                semesters.push(semesters.length + 1)
            }
            //coordenada correspondente à coluno do codigo da materia
            if (e.x > 20 && e.x < 25) {
                //caso em que o pdf.js-extract buga e a coluna de nome da materia fica junto com o do codigo da materia
                if (e.str.split('   ').length > 1) {
                    data.push({
                        code: e.str.split('   ')[0],
                        name: e.str.split('   ')[1],
                        semester: semesters.length,
                        college: "CEFET",
                        campus: filename.split('-')[0],
                        course: filename.split('-')[1]
                    });
                    //caso em que o nome da materia é grande e tem quebra de linha    
                } else if (/\d/.test(page.content[i + 2].str)) {
                    data.push({
                        code: e.str,
                        name: page.content[i + 1].str,
                        semester: semesters.length,
                        college: "CEFET",
                        campus: filename.split('-')[0],
                        course: filename.split('-')[1]
                    });
                    //caso padrão   
                } else {
                    data.push({
                        code: e.str,
                        name: page.content[i + 1].str + page.content[i + 2].str,
                        semester: semesters.length,
                        college: "CEFET",
                        campus: filename.split('-')[0],
                        course: filename.split('-')[1]
                    });
                }

            }
        });
    });

    return data;
}

(async () => {
    readData()
})();