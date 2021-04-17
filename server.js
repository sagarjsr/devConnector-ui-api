const express = require('express');
const connectDB = require('./config/db');
const path = require('path');




const app = express();

// Connect database
connectDB();


//Define Routes
app.use(express.json({extended: false}));
app.use('/', require('./routes/routes'));

//serve static assets in production 
if(process.env.NODE_ENV === "production"){
    // set static floder
    app.use(express.static('client/bulid'));

    app.get('*', (req, res) =>{
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`server started at Port  ${PORT}`)
});