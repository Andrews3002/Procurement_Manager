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
    requestPage.style.display = 'flex'
    homePage.style.display = 'none'
    form.style.display = 'none'
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

    try{   
        const data = fs.readFileSync(filepath, 'utf8')
        const jsonData = JSON.parse(data)
        console.log('readData function completed successfully')
        return jsonData
    }
    catch{
        console.log('error reading file: ', filename)
        return[]
    }
}

function writeData(filename, data){
    console.log('writeData function called successfully')
    const filepath = path.join(__dirname, filename)

    try{
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
        console.log('writeData functions completed successfully')
        return
    }
    catch{
        console.log('error trying to write to file: ', filename)
        return
    }
}

function loadRequestTable(data){
    console.log('loadRequestTable function called successfully')
    data.forEach(entry => {
        tableBody.innerHTML += `
            <tr>
                <td>${entry.supplierName}</td>
                <td>${entry.productOrService}</td>
                <td>${entry.rating}</td>
            </tr>
        `
    })

    console.log('loadRequestTable function called successfully')
}

function updateRequestTable(data){
    console.log('loadRequestTable function called successfully')

    lastEntry = data[data.length - 1]
    
    tableBody.innerHTML += `
        <tr>
            <td>${lastEntry.supplierName}</td>
            <td>${lastEntry.productOrService}</td>
            <td>${lastEntry.rating}</td>
        </tr>
    `

    console.log('loadRequestTable function called successfully')
}


function submitRequestForm(e){
    console.log('submitRequestForm function called successfully')
    e.preventDefault()

    const requestedItem = document.querySelector('#itemRequested').value.trim()
    const dateRequested = document.querySelector('#dateRequested').value.trim()

    if (!requestedItem || !dateRequested){
        return
    }

    const data = readData('requestData.json')

    console.log(data)
    
    data.push({
        supplierName,
        productOrService,
        rating
    })

    writeData('requestData.json', data)
    updateRequestTable(readData('requestData.json'))
    openRequestPage()

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

// document.addEventListener('DOMContentLoaded', () => {
//     loadRequestTable(readData('requestData.json'))
// })








