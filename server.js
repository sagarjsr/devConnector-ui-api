const express = require('express');
const connectDB = require('./config/db');


const PORT = process.env.PORT || 5000;

const app = express();

// Connect database
connectDB();

app.get('/', (req, res) =>{
    res.send('server is up and running')
})

//Define Routes
app.use(express.json({extended: false}));
app.use('/', require('./routes/routes'));

app.listen(PORT, () =>{
    console.log(`server started at Port  ${PORT}`)
});