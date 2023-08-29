const mongoose = require("mongoose")
const { DB_COLL } = require("../util")


const productoSchema = new mongoose.Schema({
    nombre:         { type: String, required: true },
    tienda:         { type: String, required: true },
    lastUpdate:     { type: Date, required: true },
    lastPrice:     { type: Number, required: true },
    image:          {type: String},
    historial:        [{
        precio:     { type: Number, required: true },
        fecha:      { type: Date, required: true }
    }]
}, {collection: DB_COLL})

var Producto = mongoose.model("Producto", productoSchema)
module.exports.Producto = Producto