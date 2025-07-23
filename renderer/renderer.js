const fs = require('fs')
const path = require('path')

const homePage = document.querySelector('#HomePage')
const scrapePage = document.querySelector('#ScrapePage')
const supplierPage = document.querySelector('#SupplierPage')
const requestPage = document.querySelector('#RequestPage')

const scrapePageButton = document.querySelector('#ScrapePageButton')
const supplierPageButton = document.querySelector('#SupplierPageButton')
const requestPageButton = document.querySelector('#RequestPageButton')

const scrapeHomeButton = document.querySelector('#ScrapeHomeButton')
const supplierHomeButton = document.querySelector('#SupplierHomeButton')
const requestHomeButton = document.querySelector('#RequestHomeButton')

const addRequestEntryButton = document.querySelector('#RequestAddEntryButton')
const closeRequestEntryFormButton = document.querySelector('#entryFormCancelButton')

const tableBody = document.querySelector('#supplyRequestTable tbody')
const form = document.querySelector('#addEntryForm')

function openScrapePage(){
    homePage.style.display = 'none'
    scrapePage.style.display = 'flex'
}

function openSupplierPage(){
    homePage.style.display = 'none'
    supplierPage.style.display = 'flex'
}

function openRequestPage(){
    homePage.style.display = 'none'
    requestPage.style.display = 'flex'
    loadRequestTable(readData('requestData.json'))
}

function openHomePage(){
    homePage.style.display = 'flex'
    scrapePage.style.display = 'none'
    supplierPage.style.display = 'none'
    requestPage.style.display = 'none'
}

function openAddRequestEntryForm(){
    console.log('form opened successfully')
    requestPage.style.display = 'none'
    form.style.display = 'flex'
}

function closeAddRequestEntryForm(){
    form.style.display = 'none'
    requestPage.style.display = 'flex' 
}

function readData(filename){
    console.log('readData function called successfully')
    const filepath = path.join(__dirname, filename)

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err){
            console.log('error occured while reading file')
            console.error('error reading file:', filename)
            return
        }

        const jsonData = JSON.parse(data)
        
        console.log('readData function completed successfully')
        return jsonData
    })
}

function writeData(filename, data){
    console.log('writeData function called successfully')
    const filepath = path.join(__dirname, filename)

    fs.writeFile(filepath, JSON.stringify(data, null, 2), (e) => {
        if(e){
            console.error('error writing to file: ', filename)
        }

        console.log('writeData function completed successfully')
        return
    })
}

function loadRequestTable(data){
    console.log('loadRequestTable function called successfully')
    data.forEach(entry => {
        console.log(entry.supplierName)
        tableBody.innerHTML += '<tr><td>${entry.supplierName}</td><td>${entry.service}</td><td>${entry.rating</td></tr>'
        // const row = document.createElement('tr')
        // row.innerHTML = ''
        // tableBody.appendChild(row)
    })

    console.log('loadRequestTable function called successfully')
}

function submitRequestForm(e){
    console.log('submitRequestForm function called successfully')
    e.preventDefault()

    const supplierName = document.querySelector('#supplierName').value.trim()
    const productOrService = document.querySelector('#productOrService').value.trim()
    const rating = document.querySelector('#rating').value.trim()

    if (!supplierName || !productOrService || isNaN(rating)) return;

    const data = readData('requestData.json')

    data.push({
        supplierName,
        productOrService,
        rating
    })

    loadRequestTable(data)

    writeData('requestData.json', data)

    console.log('submitRequestForm function completed successfully')
}

scrapePageButton.addEventListener('click', openScrapePage)
supplierPageButton.addEventListener('click', openSupplierPage)
requestPageButton.addEventListener('click', openRequestPage)

scrapeHomeButton.addEventListener('click', openHomePage)
supplierHomeButton.addEventListener('click', openHomePage)
requestHomeButton.addEventListener('click', openHomePage)

addRequestEntryButton.addEventListener('click', openAddRequestEntryForm)
closeRequestEntryFormButton.addEventListener('click', closeAddRequestEntryForm)
form.addEventListener('submit', submitRequestForm)








