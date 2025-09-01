const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
    .then(res => {
        console.log('connected to MongoDB')
    })
    .catch(e => {
        console.log('error connecting to MongoDB', e.message)
    })

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

noteSchema.set('toJSON', {
    transform: (doc, returnedObj) => {
        returnedObj._id = returnedObj._id.toString()
        delete returnedObj._id
        delete returnedObj.__v
    }
})

const Note = mongoose.model('Note', noteSchema)

module.exports = mongoose.model('Note', noteSchema)
