//import dependencies
//npm install express cors body-parser nodemon

const express = require('express')
const app = express() //makes making a server in node easier
const bodyParser = require('body-parser') //parse incoming requests
const cors = require('cors') //so front end and back end can share data
const port = 3000
//nodemon allows for live backend development (updates server when we update script here)


// We are using our packages here
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
 extended: true})); 
app.use(cors())

//You can use this to check if your server is working
app.get('/', (req, res)=>{
res.send("Welcome to your server")
})


//Route that handles annotation logic
app.post('/annotate', (req, res) =>{ 
console.log(req.body.annotation)
})

//Start your server on a specified port
app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
})
