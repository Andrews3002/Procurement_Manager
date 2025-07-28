const fs = require('fs')
const path = require('path')

const homePage = document.querySelector('#homePage')
const updateDatabasePage = document.querySelector('#updateDatabasePage')
const browseSuppliersPage = document.querySelector('#browseSuppliersPage')
const requestedItemsPage = document.querySelector('#requestedItemsPage')

const updateDatabasePageButton = document.querySelector('#updateDatabasePageButton')
const browseSuppliersPageButton = document.querySelector('#browseSuppliersPageButton')
const requestedItemsPageButton = document.querySelector('#requestedItemsPageButton')

const updateDatabasePageHomeButton = document.querySelector('#updateDatabasePageHomeButton')
const browseSuppliersPageHomeButton = document.querySelector('#browseSuppliersPageHomeButton')
const requestedItemsPageHomeButton = document.querySelector('#requestedItemsPageHomeButton')

const requestedItemsPageAddItemButton = document.querySelector('#requestedItemsPageAddItemButton')
const entryFormCancelButton = document.querySelector('#entryFormCancelButton')

const requestedItemsPageTableTableBody = document.querySelector('#requestedItemsPageTable tbody')
const addEntryForm = document.querySelector('#addEntryForm')

requestedItemID = 0

function openUpdateDatabasePage(){
    homePage.style.display = 'none'
    updateDatabasePage.style.display = 'flex'
}

function openBrowseSuppliersPage(){
    homePage.style.display = 'none'
    browseSuppliersPage.style.display = 'flex'
}

function openRequestedItemsPage(){
    requestedItemsPage.style.display = 'flex'
    homePage.style.display = 'none'
    addEntryForm.style.display = 'none'
}

function openHomePage(){
    homePage.style.display = 'flex'
    updateDatabasePage.style.display = 'none'
    browseSuppliersPage.style.display = 'none'
    requestedItemsPage.style.display = 'none'
}

function openAddRequestEntryForm(){
    console.log('addEntryForm opened successfully')
    requestedItemsPage.style.display = 'none'
    addEntryForm.style.display = 'flex'
}

function closeAddRequestEntryForm(){
    addEntryForm.style.display = 'none'
    requestedItemsPage.style.display = 'flex' 
}

function readJsonFile(filename){
    console.log('readJsonFile function called successfully')
    const filepath = path.join(__dirname, filename)

    try{   
        const data = fs.readFileSync(filepath, 'utf8')
        const jsonData = JSON.parse(data)
        console.log('readJsonFile function completed successfully')
        return jsonData
    }
    catch{
        console.log('error reading file: ', filename)
        return[]
    }
}

function writeDataToJsonFile(filename, data){
    console.log('writeDataToJsonFile function called successfully')
    const filepath = path.join(__dirname, filename)

    try{
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
        console.log('writeDataToJsonFile functions completed successfully')
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
        requestedItemID = requestedItemID + 1
        entry.requestedItemID = requestedItemID

        const dateObj = new Date(entry.dateRequested.year, entry.dateRequested.month-1, entry.dateRequested.day)
        const textDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        requestedItemsPageTableTableBody.innerHTML += `
            <tr>
                <td>${entry.requestedItem}</td>
                <td>${textDate}</td>
                <td>
                    <button class="button">VIEW</button>
                </td>
                <td>${entry.selectedCompany}</td>
            </tr>
        `
    })

    console.log('loadRequestTable function called successfully')
}

function updateRequestTable(data){
    console.log('loadRequestTable function called successfully')

    lastEntry = data[data.length - 1]

    const dateObj = new Date(lastEntry.dateRequested.year, lastEntry.dateRequested.month-1, lastEntry.dateRequested.day)
    const textDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    requestedItemsPageTableTableBody.innerHTML += `
        <tr>
            <td>${lastEntry.requestedItem}</td>
            <td>${textDate}</td>
            <td>
                <button class="button">VIEW</button>
            </td>
            <td>${lastEntry.selectedCompany}</td>
        </tr>
    `

    console.log('loadRequestTable function called successfully')
}

function submitRequestForm(e){
    console.log('submitRequestForm function called successfully')
    e.preventDefault()

    const requestedItem = document.querySelector('#itemRequested').value.trim()
    const dateValue = document.querySelector('#dateField').value.trim()
    const monthValue = document.querySelector('#monthField').value.trim()
    const yearValue = document.querySelector('#yearField').value.trim()

    if (!requestedItem || !dateValue || !monthValue || !yearValue){
        return
    }

    console.log(dateValue)
    console.log(monthValue)
    console.log(yearValue)

    dateRequested = {
        "day": dateValue,
        "month": monthValue,
        "year": yearValue
    }
    requestedItemID = requestedItemID + 1
    pendingCompanies = []
    selectedCompany = 'pending'

    const data = readJsonFile('requestData.json')
    
    data.push({
        requestedItemID,
        requestedItem,
        dateRequested,
        pendingCompanies,
        selectedCompany,
    })

    writeDataToJsonFile('requestData.json', data)
    updateRequestTable(readJsonFile('requestData.json'))
    openRequestedItemsPage()

    console.log('submitRequestForm function completed successfully')
}

updateDatabasePageButton.addEventListener('click', openUpdateDatabasePage)
browseSuppliersPageButton.addEventListener('click', openBrowseSuppliersPage)
requestedItemsPageButton.addEventListener('click', openRequestedItemsPage)

updateDatabasePageHomeButton.addEventListener('click', openHomePage)
browseSuppliersPageHomeButton.addEventListener('click', openHomePage)
requestedItemsPageHomeButton.addEventListener('click', openHomePage)

requestedItemsPageAddItemButton.addEventListener('click', openAddRequestEntryForm)
entryFormCancelButton.addEventListener('click', closeAddRequestEntryForm)
addEntryForm.addEventListener('submit', submitRequestForm)

document.addEventListener('DOMContentLoaded', () => {
    loadRequestTable(readJsonFile('requestData.json'))
})