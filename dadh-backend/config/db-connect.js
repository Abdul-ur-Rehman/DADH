const mongoose = require('mongoose')
require('dotenv').config() 

const URI = process.env.URI

const connectDB = async (req, res) => {

    try {
        await mongoose.connect(URI,{
            connectTimeoutMS: 60000,  // Increase connection timeout to 60 seconds
            socketTimeoutMS: 60000,   // Increase socket timeout to 60 seconds
          });
        console.log(`Database is connected successfully`)
    }
    catch (err) {
        console.error(`Database is not connected due to : ${err}`)
        process.exit(1)
    }
}

module.exports = connectDB