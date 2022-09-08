const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {};
const fs = require('fs');

//deu erro: Ciências Biológicas (Lic.) - Consórcio CEDERJ-UERJ.pdf e Administração - Maracanã (RIO)
const readData = async () => {
    var json = [];
    const files = fs.readdirSync(__dirname + `../uerj/`)
    for (var e of files) {
        try {
            var data = await pdfExtract.extract((__dirname + `../uerj/` + e), options);
            var content = extractContent(data.pages, e);
            json = [...json, ...content]
        } catch (err) {
            console.log(e)
        }
    }

    fs.writeFile(__dirname + "../json/uerj", JSON.stringify(json) , function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

const extractContent = (pages, course) => {
    try {
        var data = [];
        //pra UERJ temos sempre só 1 pagina de pdf
        var semesters = pages[0].content.filter(e => e.str.includes('º'));
        semesters.forEach((e,i) => {
            //pegando todos elementos com x menor que o do texto do semestre
            var content = pages[0].content.filter(c => {
                if(i === 0) return c.x < e.x;
                else return c.x < e.x && c.x > semesters[i-1].x;
            } );

            //ordenando os elementos por y ou seja do mais alto para o mais baixo
            content.sort(function(a, b) {
                return a.y - b.y;
            });

            //primeiro localiza o codigo, depois o nome vai ser a soma de todos entre 2 codigos
            var lastcodeIndex = -1;
            content.forEach((x,i) => {
                if(x.str.includes('-') && x.str.length === 19 && /\d/.test(x.str)) {
                    var name = '';
                    for(var j = lastcodeIndex + 1;j < i; j++) {
                        name += content[j].str;
                    }
                    data.push({name: name, code: x.str,semester: e.str,course: course, college:'UERJ'})
                    name = '';
                    lastcodeIndex = i;
                }
            });
        });

        return data;
    } catch (err) {
        console.log(err)
    }
}

(async () => {
    readData()
})();