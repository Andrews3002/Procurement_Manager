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

const table = document.querySelector('#supplyRequestTable tbody')
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





