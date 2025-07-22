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
}

function openHomePage(){
    homePage.style.display = 'flex'
    scrapePage.style.display = 'none'
    supplierPage.style.display = 'none'
    requestPage.style.display = 'none'
}

scrapePageButton.addEventListener('click', openScrapePage)
supplierPageButton.addEventListener('click', openSupplierPage)
requestPageButton.addEventListener('click', openRequestPage)

scrapeHomeButton.addEventListener('click', openHomePage)
supplierHomeButton.addEventListener('click', openHomePage)
requestHomeButton.addEventListener('click', openHomePage)


function loadData(filename){
    const filepath = path.join(__dirname, filename)

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err){
            console.error('error reading file:', filename)
        }

        const jsonData = JSON.parse(data)

        return jsonData
    })
}

function loadRequestTable(data){
    tableBody.innerHTML = ''

    data.forEach(entry => {
        const row = document.createElement('tr')
        row.innerHTML = '<td>${entry.supplierName}</td><td>${entry.service}</td><td>${entry.rating</td>'
        tableBody.appendChild(row)
    })
}

form.addEventListener('submit', e => {
    e.preventDefault()

    const supplierName = document.querySelector('#supplierName').value.trim()
    const productOrService = document.querySelector('#productOrService').value.trim()
    const rating = document.querySelector('#rating').value.trim()

    if (!supplierName || !productOrService || isNaN(rating)) return;

    const data = loadData('requestData.json')

    data.push({
        supplierName,
        productOrService,
        rating
    })

    loadRequestTable(data)
})








