const { chromium } = require('playwright')
const {Producto} = require("./model/Producto")
const { ENV } = require("./util")

async function startLaSirenaScraping(){

    console.log("Starting scraping of \"La Sirena\"")

    const browser = await chromium.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(`https://sirena.do/products/category/alimentacion?limit=${ENV == 'PROD'? "0": "50"}&sort=1`, {waitUntil:'networkidle',timeout: 1200000})
    // await page.waitForLoadState("networkidle", {timeout: 600000})

    var rows = await page.locator("div.item-product").all()

    var data = []

    for(const item of rows){

        try{
            var nombre = (await item.locator("p.item-product-title").textContent()).trim()
            var precio = (await item.locator("p.item-product-price").textContent()).trim()
            var imageStyle = await item.locator("a.item-product-image").getAttribute("style")

            const regex = /url\("([^"]+)"\)/;
            const image = imageStyle.match(regex)[1];

            precio = parseFloat(precio.replace("$","").replace(",",""))


            var newProduct = {
                nombre, 
                tienda: "La Sirena", 
                lastUpdate: new Date(),
                lastPrice: precio,
                image,
                historial: [{
                    precio,  
                    fecha: new Date()
                }]
            }
            // console.log(newProduct)

            const {historial, lastUpdate, lastPrice, ...rest} = newProduct

            await Producto.updateOne(
                {"nombre": newProduct.nombre, "tienda": "La Sirena"},
                {
                    "$push": {"historial": historial[0]}, 
                    "$set": {"lastUpdate": lastUpdate, "lastPrice": lastPrice},
                    "$setOnInsert": rest
                },
                {upsert: true}
            ).then(()=>{
                console.log(`Product "${newProduct.nombre}" was succesfully saved in database`)
            })
            .catch((e)=>{
                console.log(`Error inserting product "${newProduct.nombre}" in database`)
                console.error(e)
            })

            data.push(newProduct)
        }catch(e){
            console.log(`Error scraping product`)
            console.error(e)
        }
        
    }

    console.log(data.length + " scraped products on \"La Sirena\"");

    browser.close()
}

module.exports = { startLaSirenaScraping }

