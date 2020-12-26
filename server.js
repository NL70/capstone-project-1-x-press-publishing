const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const errorhandler = require('errorhandler')
const morgan = require('morgan')
const app = express()
const port = process.env.PORT || 4000

app.use(errorhandler())
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('tiny'))

const apiRouter = require('./api/api')
app.use('/api', apiRouter)

app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})

module.exports = app