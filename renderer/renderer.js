const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
requestedItemID = 0
selectedItemID = 0
selectedSupplierID = ""
selectedItemSupplierID = ""

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

    const data = readJsonFile('items.json')
    
    data.push({
        requestedItemID,
        requestedItem,
        dateRequested,
        pendingCompanies,
        selectedCompany,
    })

    const sortedData = sortItems(data)
    writeDataToJsonFile('items.json', sortedData)
    loadRequestTable(sortedData)
    addEntryForm.style.display = "none"
    requestedItemsPage.style.display = "flex"
}
addEntryForm.addEventListener('submit', submitRequestForm)

// Opening the considered companies page----------------------------------------------------------------------------------------------------------
// And selecting an item for removing --------------------------------------------------------------------------------------------------------------------
const companyConsiderationPage = document.querySelector('#companyConsiderationPage')
const requestedItemsPageTableBody = document.querySelector('#requestedItemsPageTable tbody')

let selectedItemRow = null

requestedItemsPageTableBody.addEventListener('click', (event) => {
    if(event.target.classList.contains('button')){
        requestedItemsPage.style.display = 'none'
        companyConsiderationPage.style.display = 'flex'
        const itemRow = event.target.closest('tr')
        selectedItemID = itemRow.dataset.id
        return
    }

    const row = event.target.closest('tr')

    allRows = requestedItemsPageTableBody.querySelectorAll('tr')

    allRows.forEach(r => {
        r.style.border = 'none'
    })

    if(row === selectedItemRow){
        row.style.border = 'none'
        selectedItemRow = null
        selectedItemID = 0
    }
    else{
        row.style.border = '3px blue solid'
        selectedItemRow = row
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

    const items = readJsonFile("items.json")
    
    const newItems = items.filter(obj => obj.requestedItemID != selectedItemID)

    const sortedData = sortItems(newItems)
    writeDataToJsonFile("items.json", sortedData)
    loadRequestTable(sortedData)

    removeItemForm.style.display = "none"
    requestedItemsPage.style.display = "flex"
})

//Adding dropdown menu sorting functionality to sort the items-----------------------------------------------------------------------------------------------------------------------
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
    const data = sortItems(readJsonFile("items.json"))
    writeDataToJsonFile("items.json", data)
    loadRequestTable(data)
})

//Adding the function of selecting a supplier in the browseSuppliers page-------------------------------------------------------------------------------------------------------
const browseSuppliersPageTableContentRows = document.querySelector('#browseSuppliersPageTableContentRows')
let selectedSupplierRow = null

browseSuppliersPageTableContentRows.addEventListener('click', (event) => {
    const row = event.target.closest('tr')
    const allRows = browseSuppliersPageTableContentRows.querySelectorAll('tr')

    allRows.forEach(r => {
        r.style.border = "none"
    })

    if (row === selectedSupplierRow){
        row.style.border = "none"
        selectedSupplierRow = null
        selectedSupplierID = ""
    }
    else{
        row.style.border = "3px blue solid"
        selectedSupplierRow = row
        selectedSupplierID = row.dataset.id
    }
})

//Opening the details page for each browsed supplier------------------------------------------------------------------------------------------------------------------
const browseSuppliersPageDetailsButton = document.querySelector('#browseSuppliersPageDetailsButton')
const supplierDetailsPage = document.querySelector('#supplierDetailsPage')
const supplierHeaderName = document.querySelector('#supplierDetailsPageNavbar h1')
const supplierDetailsPageSupplierNumber = document.querySelector('#supplierDetailsPageSupplierNumber')
const supplierDetailsPageServices = document.querySelector('#supplierDetailsPageServices')
const supplierDetailsPageBuildingName = document.querySelector('#supplierDetailsPageBuildingName')
const supplierDetailsPageStreetAddress1 = document.querySelector('#supplierDetailsPageStreetAddress1')
const supplierDetailsPageStreetAddress2 = document.querySelector('#supplierDetailsPageStreetAddress2')
const supplierDetailsPageStreetAddress3 = document.querySelector('#supplierDetailsPageStreetAddress3')
const supplierDetailsPageCity = document.querySelector('#supplierDetailsPageCity')
const supplierDetailsPageSupplierType = document.querySelector('#supplierDetailsPageSupplierType')
const supplierDetailsPageEmployeesQuantity = document.querySelector('#supplierDetailsPageEmployeesQuantity')
const supplierDetailsPageNatureOfBusinessOrService = document.querySelector('#supplierDetailsPageNatureOfBusinessOrService')
const supplierDetailsPageFirmLegalName = document.querySelector('#supplierDetailsPageFirmLegalName')
const supplierDetailsPageOperatedUnderOtherBusiness = document.querySelector('#supplierDetailsPageOperatedUnderOtherBusiness')
const supplierDetailsPageOtherBusinessName = document.querySelector('#supplierDetailsPageOtherBusinessName')
const supplierDetailsPageSubsidiaryAffiliateFirm = document.querySelector('#supplierDetailsPageSubsidiaryAffiliateFirm')
const supplierDetailsPageAffiliatesName = document.querySelector('#supplierDetailsPageAffiliatesName')
const supplierDetailsPageLegalQuery = document.querySelector('#supplierDetailsPageLegalQuery')
const supplierDetailsPageLegalQueryDetails = document.querySelector('#supplierDetailsPageLegalQueryDetails')
const supplierDetailsPageIncorporationOrRegistrationYear = document.querySelector('#supplierDetailsPageIncorporationOrRegistrationYear')
const supplierDetailsPageIncorporationOrRegistrationCountry = document.querySelector('#supplierDetailsPageIncorporationOrRegistrationCountry')
const supplierDetailsPageWebsiteAddress = document.querySelector('#supplierDetailsPageWebsiteAddress')
const supplierDetailsPageMunicipality = document.querySelector('#supplierDetailsPageMunicipality')
const supplierDetailsPageCountry = document.querySelector('#supplierDetailsPageCountry')
const supplierDetailsPagePostalCode = document.querySelector('#supplierDetailsPagePostalCode')
const supplierDetailsPageTelephone = document.querySelector('#supplierDetailsPageTelephone')
const supplierDetailsPageAddressType = document.querySelector('#supplierDetailsPageAddressType')
const supplierDetailsPageCreatedBy = document.querySelector('#supplierDetailsPageCreatedBy')
const supplierDetailsPageCreatedTimestamp = document.querySelector('#supplierDetailsPageCreatedTimestamp')

browseSuppliersPageDetailsButton.addEventListener('click', () => {
    if (selectedSupplierID == ""){
        return
    }

    browseSuppliersPage.style.display = "none"
    supplierDetailsPage.style.display = "flex"

    const suppliersData = readJsonFile("suppliers.json")

    const supplier = suppliersData.find(obj => obj.supplierNumber == selectedSupplierID)

    supplierHeaderName.innerText = supplier.supplierName
    supplierDetailsPageSupplierNumber.innerText = supplier.supplierNumber
    supplierDetailsPageServices.innerText = supplier.services
    supplierDetailsPageBuildingName.innerText = supplier.buildingName
    supplierDetailsPageStreetAddress1.innerText = supplier.streetAddress1
    supplierDetailsPageStreetAddress2.innerText = supplier.streetAddress2
    supplierDetailsPageStreetAddress3.innerText = supplier.streetAddress3
    supplierDetailsPageCity.innerText = supplier.city
    supplierDetailsPageSupplierType.innerText = supplier.supplierType
    supplierDetailsPageEmployeesQuantity.innerText = supplier.employeesQuantity
    supplierDetailsPageNatureOfBusinessOrService.innerText = supplier.natureOfBusinessOrService
    supplierDetailsPageFirmLegalName.innerText = supplier.firmLegalName
    supplierDetailsPageOperatedUnderOtherBusiness.innerText = supplier.operatedUnderOtherBusiness
    supplierDetailsPageOtherBusinessName.innerText = supplier.otherBusinessName
    supplierDetailsPageSubsidiaryAffiliateFirm.innerText = supplier.subsidiaryAffiliateFirm
    supplierDetailsPageAffiliatesName.innerText = supplier.affiliatesName
    supplierDetailsPageLegalQuery.innerText = supplier.legalQuery
    supplierDetailsPageLegalQueryDetails.innerText = supplier.legalQueryDetails
    supplierDetailsPageIncorporationOrRegistrationYear.innerText = supplier.incorporationOrRegistrationYear
    supplierDetailsPageIncorporationOrRegistrationCountry.innerText = supplier.incorporationOrRegistrationCountry
    supplierDetailsPageWebsiteAddress.innerText = supplier.websiteAddress
    supplierDetailsPageMunicipality.innerText = supplier.municipality
    supplierDetailsPageCountry.innerText = supplier.country
    supplierDetailsPagePostalCode.innerText = supplier.postalCode
    supplierDetailsPageTelephone.innerText = supplier.telephone
    supplierDetailsPageAddressType.innerText = supplier.addressType
    supplierDetailsPageCreatedBy.innerText = supplier.createdBy
    supplierDetailsPageCreatedTimestamp.innerText = supplier.createdTimestamp
})

//Adding search functionality for the browse suppliers page----------------------------------------------------------------------------------------------------


//Going back to browsesupplierpage from supplierdetails page----------------------------------------------------------------------------------------------------
const supplierDetailsPageBackButton = document.querySelector('#supplierDetailsPageBackButton')

supplierDetailsPageBackButton.addEventListener('click', () => {
    supplierDetailsPage.style.display = "none"
    browseSuppliersPage.style.display = "flex"
})

//Adding functionality of selecting a supplier in the item_suppliers page---------------------------------------------------------------------------------------------
const item_browseSuppliersPageTableContentRows = document.querySelector('#item_browseSuppliersPageTableContentRows')
let selectedItemSupplierRow = null

item_browseSuppliersPageTableContentRows.addEventListener('click', (event) => {
    const row = event.target.closest('tr')
    const allRows = item_browseSuppliersPageTableContentRows.querySelectorAll('tr')

    allRows.forEach(r => {
        r.style.border = "none"
    })

    if (row === selectedItemSupplierRow){
        row.style.border = "none"
        selectedItemSupplierRow = null
        selectedItemSupplierID = ""
    }
    else{
        row.style.border = "3px blue solid"
        selectedItemSupplierRow = row
        selectedItemSupplierID = row.dataset.id
    }
})

//Adding the functionality to view the details of a selected item_supplier---------------------------------------------------------------------------------------------
const item_browseSuppliersPageDetailsButton = document.querySelector('#item_browseSuppliersPageDetailsButton')
const item_supplierDetailsPage = document.querySelector('#item_supplierDetailsPage')
const item_supplierHeaderName = document.querySelector('#item_supplierDetailsPageNavbar h1')
const item_supplierDetailsPageSupplierNumber = document.querySelector('#item_supplierDetailsPageSupplierNumber')
const item_supplierDetailsPageServices = document.querySelector('#item_supplierDetailsPageServices')
const item_supplierDetailsPageBuildingName = document.querySelector('#item_supplierDetailsPageBuildingName')
const item_supplierDetailsPageStreetAddress1 = document.querySelector('#item_supplierDetailsPageStreetAddress1')
const item_supplierDetailsPageStreetAddress2 = document.querySelector('#item_supplierDetailsPageStreetAddress2')
const item_supplierDetailsPageStreetAddress3 = document.querySelector('#item_supplierDetailsPageStreetAddress3')
const item_supplierDetailsPageCity = document.querySelector('#item_supplierDetailsPageCity')
const item_supplierDetailsPageSupplierType = document.querySelector('#item_supplierDetailsPageSupplierType')
const item_supplierDetailsPageEmployeesQuantity = document.querySelector('#item_supplierDetailsPageEmployeesQuantity')
const item_supplierDetailsPageNatureOfBusinessOrService = document.querySelector('#item_supplierDetailsPageNatureOfBusinessOrService')
const item_supplierDetailsPageFirmLegalName = document.querySelector('#item_supplierDetailsPageFirmLegalName')
const item_supplierDetailsPageOperatedUnderOtherBusiness = document.querySelector('#item_supplierDetailsPageOperatedUnderOtherBusiness')
const item_supplierDetailsPageOtherBusinessName = document.querySelector('#item_supplierDetailsPageOtherBusinessName')
const item_supplierDetailsPageSubsidiaryAffiliateFirm = document.querySelector('#item_supplierDetailsPageSubsidiaryAffiliateFirm')
const item_supplierDetailsPageAffiliatesName = document.querySelector('#item_supplierDetailsPageAffiliatesName')
const item_supplierDetailsPageLegalQuery = document.querySelector('#item_supplierDetailsPageLegalQuery')
const item_supplierDetailsPageLegalQueryDetails = document.querySelector('#item_supplierDetailsPageLegalQueryDetails')
const item_supplierDetailsPageIncorporationOrRegistrationYear = document.querySelector('#item_supplierDetailsPageIncorporationOrRegistrationYear')
const item_supplierDetailsPageIncorporationOrRegistrationCountry = document.querySelector('#item_supplierDetailsPageIncorporationOrRegistrationCountry')
const item_supplierDetailsPageWebsiteAddress = document.querySelector('#item_supplierDetailsPageWebsiteAddress')
const item_supplierDetailsPageMunicipality = document.querySelector('#item_supplierDetailsPageMunicipality')
const item_supplierDetailsPageCountry = document.querySelector('#item_supplierDetailsPageCountry')
const item_supplierDetailsPagePostalCode = document.querySelector('#item_supplierDetailsPagePostalCode')
const item_supplierDetailsPageTelephone = document.querySelector('#item_supplierDetailsPageTelephone')
const item_supplierDetailsPageAddressType = document.querySelector('#item_supplierDetailsPageAddressType')
const item_supplierDetailsPageCreatedBy = document.querySelector('#item_supplierDetailsPageCreatedBy')
const item_supplierDetailsPageCreatedTimestamp = document.querySelector('#item_supplierDetailsPageCreatedTimestamp')

item_browseSuppliersPageDetailsButton.addEventListener('click', () => {
    if (selectedItemSupplierID == ""){
        return
    }

    item_browseSuppliersPage.style.display = "none"
    item_supplierDetailsPage.style.display = "flex"

    const item_suppliersData = readJsonFile("suppliers.json")

    const item_supplier = item_suppliersData.find(obj => obj.supplierNumber == selectedItemSupplierID)

    item_supplierHeaderName.innerText = item_supplier.supplierName
    item_supplierDetailsPageSupplierNumber.innerText = item_supplier.supplierNumber
    item_supplierDetailsPageServices.innerText = item_supplier.services
    item_supplierDetailsPageBuildingName.innerText = item_supplier.buildingName
    item_supplierDetailsPageStreetAddress1.innerText = item_supplier.streetAddress1
    item_supplierDetailsPageStreetAddress2.innerText = item_supplier.streetAddress2
    item_supplierDetailsPageStreetAddress3.innerText = item_supplier.streetAddress3
    item_supplierDetailsPageCity.innerText = item_supplier.city
    item_supplierDetailsPageSupplierType.innerText = item_supplier.supplierType
    item_supplierDetailsPageEmployeesQuantity.innerText = item_supplier.employeesQuantity
    item_supplierDetailsPageNatureOfBusinessOrService.innerText = item_supplier.natureOfBusinessOrService
    item_supplierDetailsPageFirmLegalName.innerText = item_supplier.firmLegalName
    item_supplierDetailsPageOperatedUnderOtherBusiness.innerText = item_supplier.operatedUnderOtherBusiness
    item_supplierDetailsPageOtherBusinessName.innerText = item_supplier.otherBusinessName
    item_supplierDetailsPageSubsidiaryAffiliateFirm.innerText = item_supplier.subsidiaryAffiliateFirm
    item_supplierDetailsPageAffiliatesName.innerText = item_supplier.affiliatesName
    item_supplierDetailsPageLegalQuery.innerText = item_supplier.legalQuery
    item_supplierDetailsPageLegalQueryDetails.innerText = item_supplier.legalQueryDetails
    item_supplierDetailsPageIncorporationOrRegistrationYear.innerText = item_supplier.incorporationOrRegistrationYear
    item_supplierDetailsPageIncorporationOrRegistrationCountry.innerText = item_supplier.incorporationOrRegistrationCountry
    item_supplierDetailsPageWebsiteAddress.innerText = item_supplier.websiteAddress
    item_supplierDetailsPageMunicipality.innerText = item_supplier.municipality
    item_supplierDetailsPageCountry.innerText = item_supplier.country
    item_supplierDetailsPagePostalCode.innerText = item_supplier.postalCode
    item_supplierDetailsPageTelephone.innerText = item_supplier.telephone
    item_supplierDetailsPageAddressType.innerText = item_supplier.addressType
    item_supplierDetailsPageCreatedBy.innerText = item_supplier.createdBy
    item_supplierDetailsPageCreatedTimestamp.innerText = item_supplier.createdTimestamp

})

//Going back to item_browsesupplierpage from item_supplierdetails page----------------------------------------------------------------------------------------------------
const item_supplierDetailsPageBackButton = document.querySelector('#item_supplierDetailsPageBackButton')

item_supplierDetailsPageBackButton.addEventListener('click', () => {
    item_supplierDetailsPage.style.display = "none"
    item_browseSuppliersPage.style.display = "flex"
})

// Initialization functions--------------------------------------------------------------------------------------------------------------------

function loadItemSuppliersTable(data){
    item_browseSuppliersPageTableContentRows.innerHTML = ''

    if (data != []){
        data.forEach(entry => {
            item_browseSuppliersPageTableContentRows.innerHTML += `
                <tr data-id = "${entry.supplierNumber}">
                    <td>${entry.supplierName}</td>
                    <td>${entry.status}</td>
                    <td>${entry.telephone}</td>
                    <td>${entry.websiteAddress}</td>
                </tr>
            `
        })
    }

}

function loadSuppliersTable(data){
    browseSuppliersPageTableContentRows.innerHTML = ''

    if (data != []){
        data.forEach(entry => {
            browseSuppliersPageTableContentRows.innerHTML += `
                <tr data-id = "${entry.supplierNumber}">
                    <td>${entry.supplierName}</td>
                    <td>${entry.status}</td>
                    <td>${entry.telephone}</td>
                    <td>${entry.websiteAddress}</td>
                </tr>
            `
        })
    }

}

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
    const suppliers = readJsonFile('suppliers.json')
    loadSuppliersTable(suppliers)
    loadItemSuppliersTable(suppliers)
    const items = sortItems(readJsonFile('items.json'))
    writeDataToJsonFile("items.json", items)
    loadRequestTable(items)
})