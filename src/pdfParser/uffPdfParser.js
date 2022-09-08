const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {};
const fs = require('fs');

const readData = async () => {
    var json = [];
    const files = fs.readdirSync(__dirname + `../uff/`)
    for (var e of files) {
        try {
            var data = await pdfExtract.extract((__dirname + `../uff/` + e), options);
            var course = data.pages[0].content.filter(e => e.str.includes('Curso:'))[0].str.split(':')[1]
            var content = extractContent(data.pages, course);
            json = [...json, ...content]
        } catch (err) {
            console.log(e)
        }
    }

    fs.writeFile(__dirname + "../json/uff", JSON.stringify(json) , function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

const extractContent = (pages, course) => {
    var data = [];
    var semesters = [];
    pages.forEach(page => {
        page.content.forEach((e, i) => {
            if (e.str.includes('período') && !e.str.includes('completo')) {
                semesters.push(semesters.length + 1)
            }
            //coordenada correspondente à coluno do codigo da materia
            if (e.x > 20 && e.x < 28) {
                if (e.str.length === 8) {
                    //caso em que o nome da materia é grande e tem quebra de linha
                    if (/\d/.test(page.content[i + 2].str)) {
                        data.push({
                            code: e.str,
                            name: page.content[i + 1].str,
                            semester: semesters.length,
                            college: "Uff",
                            course: course,
                        });
                        //caso padrão   
                    } else {
                        data.push({
                            code: e.str,
                            name: page.content[i + 1].str + page.content[i + 2].str,
                            semester: semesters.length,
                            college: "Uff",
                            course: course,
                        });
                    }
                }
            }
        });
    });

    return data;
}

(async () => {
    readData()
})();