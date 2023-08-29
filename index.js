const mongoose = require("mongoose")
const { MONGO_URL, DB_COLL } = require("./util")
const { startLaSirenaScraping } = require( "./laSirena_scraper")
const {startPlazaLamaScraping } = require("./plazaLama_scraper")
 
mongoose.connect(MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
    }
).catch(error => {console.error(error)});
  
mongoose.connection
    .on("error", console.error.bind(console, "Connection Error"))
    .once("open", async ()=>{
        console.log("Connected to Mongo")
        console.log("Collection: " +  DB_COLL)
        await startLaSirenaScraping()
        await startPlazaLamaScraping()
        mongoose.connection.close();
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    })



