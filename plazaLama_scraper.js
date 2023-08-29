const { chromium } = require('playwright')
const {Producto} = require("./model/Producto")
const { ENV } = require("./util")


const URL = `https://plazalama.com.do/collections/supermercado?sort_by=price-descending`


async function startPlazaLamaScraping(){

    console.log("Starting scraping of \"Plaza Lama\"")

    const browser = await chromium.launch({headless: true})
    const page = await browser.newPage()
    const itemPage = await browser.newPage()

    async function parse(pageURL, n=0){

        var data = []

        await page.goto(pageURL, {timeout: 1200000})
        // await page.waitForLoadState("networkidle", {timeout: 300000})


        const sizes = await page.evaluate(() => {
            const browserHeight = window.innerHeight;
            const pageHeight = document.body.scrollHeight;
        
            return { browserHeight, pageHeight };
          });
        
          for (let i = 0; i < sizes.pageHeight; i += sizes.browserHeight) {
            await page.mouse.wheel(0, i);
            // console.log("scrolled to", i);
            await page.waitForTimeout(1000);
        }
    
        var next
        try{
            next = await page.locator("a.pagination__next").getAttribute("href")
        }catch(e){
            next = undefined
        }

        var page_elements = await page.locator("div.product-item").all()

        for( const item of page_elements){
            data.push(await scrap_item(item))
        }
    
        if(next && (ENV == 'PROD' || n <=3)){
            n += 1
            console.log("next " + next)
            return [...data, ...(await parse(`https://plazalama.com.do${next}`, n))]
        }
    
        return data
    
    }
    
    async function scrap_item(item){
        try{
            var nombre =  (await item.locator("a.product-item__title").textContent()).trim()
            var precio = (await item.locator("div.product-item__price-list span.price").first().textContent()).trim()

            var dataSrcSet
            try{
                dataSrcSet  = await item.locator("img.product-item__primary-image").first().getAttribute("data-srcset")
            }catch(e){
                dataSrcSet = undefined
            }
            
            
            // var image = dataSrcSet.split(" ")[0]

            var image = dataSrcSet && dataSrcSet !== "" ? dataSrcSet.split(" ")[0] : ""

            const regex = /(\d{1,3}(?:,\d{3})*\.\d{2})/;
            precio = precio.match(regex)[0]
            precio = parseFloat(precio.replace(",",""))

            var newProduct = {
                nombre, 
                tienda: "Plaza Lama", 
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
                {"nombre": newProduct.nombre, "tienda": "Plaza Lama"},
                {
                    "$push": {"historial": historial[0]}, 
                    "$set": {"lastUpdate": lastUpdate, "lastPrice": lastPrice},
                    "$setOnInsert": rest
                },
                {upsert: true}

            )
            .then(()=>{
                console.log(`Product "${newProduct.nombre}" was succesfully saved in database`)
            })
            .catch((e)=>{
                console.log(`Error inserting product "${newProduct.nombre}" in database`)
                console.error(e)
            })
        }catch(e){
            console.log(`Error scraping product`)
            console.error(e)
        }
        

    } 

    var data = await parse(URL)

    console.log(data.length + " scraped products on \"Plaza Lama\"");
   
    browser.close()
}

module.exports = { startPlazaLamaScraping }

