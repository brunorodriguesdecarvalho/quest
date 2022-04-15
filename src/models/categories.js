const mongoose = require('../database')

const CategoriesSchema = new mongoose.Schema({
    categoria:{
        type: String,
        unique: true,
        required: true,
    },
    free:{
        type: Boolean,
        unique: true,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
})


const Categories = mongoose.model('Categories', CategoriesSchema)

module.exports = Categories