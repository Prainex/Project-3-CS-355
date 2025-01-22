// This section is for connecting to the database

const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/authentication-info");

connect.then(() =>{
    console.log("Database connected successfully");
})
.catch(() => {
    console.log("Database can't be connected");
})


// Create a login schema
const loginSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    }
});

const collection = new mongoose.model("users", loginSchema);

module.exports = collection;