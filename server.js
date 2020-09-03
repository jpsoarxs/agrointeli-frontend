var express = require('express')
var path = require('path')
var serverStatic = require('serve-static')

var app = express()
app.use(serverStatic(path.join(__dirname, 'dist')))

var port = process.env.PORT || 3000
app.listen(port)
console.log(`Servidor iniciado na porta: ${port}`)