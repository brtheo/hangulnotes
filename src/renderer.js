const {dialog,app} = require('electron').remote
const pug = require('pug')
const pdf = require('html-pdf')
const fs = require('fs')

const hangulConvert = require('./hangul-convert')

const DRAFT_PATH = `${process.resourcesPath}\\draft`
const DRAFT_PATH_SAFE = `${process.resourcesPath}\\draft\\safe`

let pugInput = document.querySelector('#pug-input')
let preview = document.querySelector('#preview')

let filename = document.querySelector('#file-name')
let open = document.querySelector('#open')
let savetohtml = document.querySelector('#savetohtml')
let savetopdf = document.querySelector('#savetopdf')

let parser = new DOMParser()

let Editor = CodeMirror.fromTextArea(pugInput, {mode:'text/x-pug',theme:'mdn-like',lineWrapping: true, lineNumbers: true})

Editor.on('change', _ => {
    let rawHtml = ''
    let rawPug = ''
    let buildHtml = ''

    rawPug += Editor.getValue()

    rawHtml = pug.render(rawPug)
    buildHtml = parser.parseFromString(rawHtml,'text/html')
    buildHtml.querySelectorAll('.ko').forEach( e => {
        e.textContent = hangulConvert(e.textContent)
    })

    preview.innerHTML = buildHtml.querySelector('body').innerHTML
})


open.addEventListener('click', e => {
    e.preventDefault()
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: 'pug', extensions: ['pug']}
        ]
    }, file => {
        fs.readFile(file[0], 'utf-8',(err,data) => {
            if(err) throw err
            Editor.setValue(data)
        })

    })
})

savetohtml.addEventListener('click', e => {
    e.preventDefault()
    filename.value = filename.value === '' ? 'nouveau fichier' : filename.value
    let body = document.querySelector('#preview').innerHTML
    let tmp = require('./html.js/tmp.html')(filename,body, 'width: 900px;')
    let pug = Editor.getValue()
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, directory => {
        fs.writeFile(`${DRAFT_PATH}\\draft-${filename.value}.pug`, pug, err => {
            if(err) throw err
        })
        fs.writeFile(`${directory}\\${filename.value}.html`,tmp, err => {
            if(err) throw err
            console.log('sauvé')
        })
    })
})

savetopdf.addEventListener('click', e => {
    e.preventDefault()
    filename.value = filename.value === '' ? 'nouveau fichier' : filename.value
    let body = document.querySelector('#preview').innerHTML
    let tmp = require('./html.js/tmp.html')(filename,body)
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, directory => {
        fs.writeFile(`${directory}\\temp-${filename.value}.html`,tmp, err => {
            if(err) throw err
            let html = fs.readFileSync(`${directory}\\temp-${filename.value}.html`,'utf-8')
            pdf.create(html).toFile(`${directory}\\${filename.value}.pdf`, err => {
                if (err) throw err
                fs.unlinkSync(`${directory}\\temp-${filename.value}.html`)
            })
        })
    })
})

const ready = _ => {
    let getTime = f => {
        return parseInt(f.split('-')[1].split('.')[0])
    }

    let files = fs.readdirSync(`${DRAFT_PATH_SAFE}`)
    if(files.length != 0) {
        if(files.length == 2){ 
            if(getTime(files[0]) < getTime(files[1])) {
                Editor.setValue(fs.readFileSync(`${DRAFT_PATH_SAFE}\\${files[1]}`,'utf-8'))
                fs.unlinkSync(`${DRAFT_PATH_SAFE}\\${files[0]}`)
            }
        }
        else Editor.setValue(fs.readFileSync(`${DRAFT_PATH_SAFE}\\${files[0]}`,'utf-8'))
    }
}

ready()


app.on('before-quit', _ => {
    let d = new Date()
    let pug = Editor.getValue()
    if(pug !== '')
        fs.writeFileSync(`${DRAFT_PATH_SAFE}\\draft-${d.getTime()}.pug`, pug)
})