const mongoose = require('mongoose');



const profileSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
    },
    
    name:{
        type:String,
        required:true
    
    },
    img:{
        type:String,
        required:true
    },
    gender:{
        required:true,
        type:String,
        enum:["Male","Female","untouched gender"]

    },
    street: {
        type:String,
        required:true
    
    },
    postalCode: {
        type:String,
        required:true
    
    },
    city: {
        type:String,
        required:true
    
    },
    country: {
        type:String,
        required:true
    
    },
    about:{
        type:String,
        default:''
    }


},{timestamps:true});

module.exports =  mongoose.model('profile', profileSchema);