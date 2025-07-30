const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
requestedItemID = 0
selectedItemID = 0

function readJsonFile(filename){
    const filepath = path.join(__dirname, filename)

    try{   
        const data = fs.readFileSync(filepath, 'utf8')
        const jsonData = JSON.parse(data)

        requestedItemID = 0
        
        jsonData.forEach(item => {
            if (requestedItemID < item.requestedItemID){
                requestedItemID = item.requestedItemID
            }
        })

        requestedItemID += 1

        return jsonData
    }
    catch{
        console.log('error reading file: ', filename)
        return[]
    }
}

function writeDataToJsonFile(filename, data){
    const filepath = path.join(__dirname, filename)

    try{
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
        return
    }
    catch{
        console.log('error trying to write to file: ', filename)
        return
    }
}

// Opening the update database page--------------------------------------------------------------------------------------
const homePage = document.querySelector('#homePage')
const updateDatabasePage = document.querySelector('#updateDatabasePage')
const updateDatabasePageButton = document.querySelector('#updateDatabasePageButton')

updateDatabasePageButton.addEventListener('click', () => {
    homePage.style.display = 'none'
    updateDatabasePage.style.display = 'flex'
})

// Opening the browse suppliers page-------------------------------------------------------------------------------------------------------
const browseSuppliersPage = document.querySelector('#browseSuppliersPage')
const browseSuppliersPageButton = document.querySelector('#browseSuppliersPageButton')

browseSuppliersPageButton.addEventListener('click', () => {
    homePage.style.display = 'none'
    browseSuppliersPage.style.display = 'flex'
})

// Opening the requested items page------------------------------------------------------------------------------------------------------------
const requestedItemsPage = document.querySelector('#requestedItemsPage')
const addEntryForm = document.querySelector('#addEntryForm')
const requestedItemsPageButton = document.querySelector('#requestedItemsPageButton')

requestedItemsPageButton.addEventListener('click', () => {
    requestedItemsPage.style.display = 'flex'
    homePage.style.display = 'none'
    addEntryForm.style.display = 'none'
})

//Home buttons functionality--------------------------------------------------------------------------------------------------------------------
function openHomePage(){
    homePage.style.display = 'flex'
    updateDatabasePage.style.display = 'none'
    browseSuppliersPage.style.display = 'none'
    requestedItemsPage.style.display = 'none'
}

const updateDatabasePageHomeButton = document.querySelector('#updateDatabasePageHomeButton')
const browseSuppliersPageHomeButton = document.querySelector('#browseSuppliersPageHomeButton')
const requestedItemsPageHomeButton = document.querySelector('#requestedItemsPageHomeButton')

updateDatabasePageHomeButton.addEventListener('click', openHomePage)
browseSuppliersPageHomeButton.addEventListener('click', openHomePage)
requestedItemsPageHomeButton.addEventListener('click', openHomePage)

//Opening the add requested item form---------------------------------------------------------------------------------------------------
const requestedItemsPageAddItemButton = document.querySelector('#requestedItemsPageAddItemButton')

requestedItemsPageAddItemButton.addEventListener('click', () => {
    requestedItemsPage.style.display = 'none'
    addEntryForm.style.display = 'flex'
})

//Closing the entry form for a new item-------------------------------------------------------------------------------------------------------
const entryFormCancelButton = document.querySelector('#entryFormCancelButton')

entryFormCancelButton.addEventListener('click', () => {
    addEntryForm.style.display = 'none'
    requestedItemsPage.style.display = 'flex' 
})

//Adding an Item to the requestedItems database---------------------------------------------------------------------------------------
function submitRequestForm(e){
    e.preventDefault()

    const requestedItem = document.querySelector('#itemRequested').value.trim()
    const dateValue = document.querySelector('#dateField').value.trim()
    const monthValue = document.querySelector('#monthField').value.trim()
    const yearValue = document.querySelector('#yearField').value.trim()

    if (!requestedItem || !dateValue || !monthValue || !yearValue){
        return
    }

    dateRequested = {
        "day": dateValue,
        "month": monthValue,
        "year": yearValue
    }
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

    const sortedData = sortItems(data)
    writeDataToJsonFile('requestData.json', sortedData)
    loadRequestTable(sortedData)
    addEntryForm.style.display = "none"
    requestedItemsPage.style.display = "flex"
}
addEntryForm.addEventListener('submit', submitRequestForm)

// Opening the considered companies page----------------------------------------------------------------------------------------------------------
// And selecting an item for removing --------------------------------------------------------------------------------------------------------------------
const companyConsiderationPage = document.querySelector('#companyConsiderationPage')
const requestedItemsPageTableBody = document.querySelector('#requestedItemsPageTable tbody')

let selectedRow = null

requestedItemsPageTableBody.addEventListener('click', (event) => {
    if(event.target.classList.contains('button')){
        requestedItemsPage.style.display = 'none'
        companyConsiderationPage.style.display = 'flex'
        const buttonRow = event.target.closest('tr')
        selectedItemID = buttonRow.dataset.id
        return
    }

    const row = event.target.closest('tr')

    allRows = requestedItemsPageTableBody.querySelectorAll('tr')

    allRows.forEach(r => {
        r.style.border = 'none'
    })

    if(row === selectedRow){
        row.style.border = 'none'
        selectedRow = null
        selectedItemID = 0
    }
    else{
        row.style.border = '3px black solid'
        selectedRow = row
        selectedItemID = row.dataset.id
    }
})

// Closing the considered companies page----------------------------------------------------------------------------------------------------------
const companyConsiderationPageBackButton = document.querySelector('#companyConsiderationPageBackButton')

companyConsiderationPageBackButton.addEventListener('click', () => {
    requestedItemsPage.style.display = 'flex'
    companyConsiderationPage.style.display = 'none'
    selectedItemID = 0
})

//Opening the browse suppliers page to add a company for consideration-------------------------------------------------------------------------------------
const companyConsiderationPageAddCompanyButton = document.querySelector('#companyConsiderationPageAddCompanyButton')
const item_browseSuppliersPage = document.querySelector('#item_browseSuppliersPage')

companyConsiderationPageAddCompanyButton.addEventListener('click', () => {
    companyConsiderationPage.style.display = 'none'
    item_browseSuppliersPage.style.display = 'flex'
})

//Going back from the browse supplier page to the company consideratoin page------------------------------------------------------------------------------
const item_browseSuppliersPageBackButton = document.querySelector('#item_browseSuppliersPageBackButton')

item_browseSuppliersPageBackButton.addEventListener('click', () => {
    item_browseSuppliersPage.style.display = 'none'
    companyConsiderationPage.style.display = 'flex'
})

//Opening the remove Item form-------------------------------------------------------------------------------------------------------------------------------------
const removeItemForm = document.querySelector('#removeItemForm')
const requestedItemsPageRemoveItemButton = document.querySelector('#requestedItemsPageRemoveItemButton')

requestedItemsPageRemoveItemButton.addEventListener('click', () => {
    if (selectedItemID != 0){
        requestedItemsPage.style.display = "none"
        removeItemForm.style.display = "flex"
    }
})

//Canceling Removal of Item form--------------------------------------------------------------------------------------------------------------------------------------
const cancelRemovalOfItemButton = document.querySelector('#cancelRemovalOfItemButton')

cancelRemovalOfItemButton.addEventListener('click', (event) => {
    event.preventDefault()
    removeItemForm.style.display = "none"
    requestedItemsPage.style.display = "flex"
})

//Removing the Item------------------------------------------------------------------------------------------------------------------------------------------------------------
const removeItemButton = document.querySelector('#removeItemButton')

removeItemButton.addEventListener('click', (event) => {
    event.preventDefault()

    const items = readJsonFile("requestData.json")
    
    const newItems = items.filter(obj => obj.requestedItemID != selectedItemID)

    const sortedData = sortItems(newItems)
    writeDataToJsonFile("requestData.json", sortedData)
    loadRequestTable(sortedData)

    removeItemForm.style.display = "none"
    requestedItemsPage.style.display = "flex"
})

//Adding dropdown menu sorting functionality to sort the items
const requestItemsPageSortingDropdownMenu = document.querySelector('#requestItemsPageSortingDropdownMenu')

function sortItems(data){
    const sortBy = requestItemsPageSortingDropdownMenu.value

    if (sortBy == "createdAsc"){
        data.sort((a,b) => {
            return a.requestedItemID - b.requestedItemID
        })
    }
    else if (sortBy == "createdDesc"){
        data.sort((a,b) => {
            return b.requestedItemID - a.requestedItemID
        })
    }
    else if (sortBy == "itemNameAsc"){
        data.sort((a,b) => {
            return a.requestedItem.localeCompare(b.requestedItem, undefined, {sensitivity : "base"})
        })
    }
    else if (sortBy == "itemNameDesc"){
        data.sort((a,b) => {
            return b.requestedItem.localeCompare(a.requestedItem, undefined, {sensitivity : "base"})
        })
    }
    else if (sortBy == "dateAsc"){
        data.sort((a,b) => {
            const dateA = new Date(a.dateRequested.year, a.dateRequested.month - 1, a.dateRequested.day)
            const dateB = new Date(b.dateRequested.year, b.dateRequested.month - 1, b.dateRequested.day)

            return dateA - dateB
        })
    }
     else if (sortBy == "dateDesc"){
        data.sort((a,b) => {
            const dateA = new Date(a.dateRequested.year, a.dateRequested.month - 1, a.dateRequested.day)
            const dateB = new Date(b.dateRequested.year, b.dateRequested.month - 1, b.dateRequested.day)

            return dateB - dateA
        })
     }
    return data
}

requestItemsPageSortingDropdownMenu.addEventListener('change', () => {
    const data = sortItems(readJsonFile("requestData.json"))
    writeDataToJsonFile("requestData.json", data)
    loadRequestTable(data)
})

//adding functionality to the button that updates the database by running a python script
const updateDatabaseButton = document.querySelector('#updateDatabaseButton')

updateDatabaseButton.addEventListener('click', () => {
    
})






// Initialization functions--------------------------------------------------------------------------------------------------------------------
function loadRequestTable(data){
    requestedItemsPageTableBody.innerHTML = ''

    data.forEach(entry => {
        const dateObj = new Date(entry.dateRequested.year, entry.dateRequested.month-1, entry.dateRequested.day)
        const textDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        requestedItemsPageTableBody.innerHTML += `
            <tr data-id = "${entry.requestedItemID}">
                <td>${entry.requestedItem}</td>
                <td>${textDate}</td>
                <td>
                    <button class="button">VIEW</button>
                </td>
                <td>${entry.selectedCompany}</td>
            </tr>
        `
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const data = sortItems(readJsonFile('requestData.json'))
    writeDataToJsonFile("requestData.json", data)
    loadRequestTable(data)
})