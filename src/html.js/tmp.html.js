module.exports = (filename, body, style = '') => `
    <html>
        <head>
            <title>${filename.value}</title>
            <style>
                html {background: #e0e0e0;}
                .inl {display: inline-block;}
                .nl {display: block;}
                
                .center {text-align: center;}
                .w,.word,.m,.mot {display: inline;}
                .w:after, .word:after, .m:after, .mot:after { content: "\\0000a0";}
                .sec, .section {border-bottom: 2px #e0e0e0 solid; border-left: 2px #e0e0e0 solid; margin: 10px; padding: 10px;}
                body {font-family: 'Arial'; font-size: 20px; ${style} margin: 0 auto; background: white; color: #242424; padding:10px;}
            </style>
        </head>
        <body>
            ${body}
        </body>
    </html>
`