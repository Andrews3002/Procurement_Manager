const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
requestedItemID = 0
selectedItemID = 0
selectedSupplierID = ""
selectedItemSupplierID = ""
selectedConsideredID = ""
chosenCompanyIDpairs = []

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
    chosenCompany = 'pending'
    chosenCompanyID = ""

    const data = readJsonFile('items.json')
    
    data.push({
        requestedItemID,
        requestedItem,
        dateRequested,
        pendingCompanies,
        chosenCompany,
        chosenCompanyID,
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
        loadConsideredSuppliersTable()
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
    const items = readJsonFile('items.json')
    const sortedItems = sortItems(items)

    loadRequestTable(sortedItems)

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

//Adding the functionality for the user to add a company to be considered-----------------------------------------------------------------------------------------------------------
const item_supplierDetailsPageConsiderButton = document.querySelector('#item_supplierDetailsPageConsiderButton')

item_supplierDetailsPageConsiderButton.addEventListener('click', () => {
    const items = readJsonFile("items.json")
    const suppliers = readJsonFile("suppliers.json")

    let duplicate = false

    const item = items.find(obj => obj.requestedItemID == selectedItemID)
    const supplier = suppliers.find(obj => obj.supplierNumber == selectedItemSupplierID)

    const consideredCompanies = item.pendingCompanies

    consideredCompanies.forEach(comp => {
        if (comp.supplierNumber == selectedItemSupplierID){
            duplicate = true
            return
        }
    })

    if (duplicate){
        console.log(item.supplierName, " is already under consideration")
        return
    }
    
    consideredCompanies.push(supplier)

    item.pendingCompanies = consideredCompanies

    const newItems = items.filter(obj => obj.requestedItemID != selectedItemID)

    newItems.push(item)

    writeDataToJsonFile("items.json", sortItems(newItems))    
    loadConsideredSuppliersTable()

    item_supplierDetailsPage.style.display = "none"
    item_browseSuppliersPage.style.display = "flex"
})

//Adding the functionality to select a considered company from the list of companies--------------------------------------------------------------------------------------
const companyConsiderationPageTableContentRows = document.querySelector('#companyConsiderationPageTableContentRows')
const companyConsiderationPageUnselectCompanyButton = document.querySelector('#companyConsiderationPageUnselectCompanyButton')
let selectedConsideredRow = null

companyConsiderationPageTableContentRows.addEventListener('click', (event) => {
    const row = event.target.closest('tr')

    const allRows = companyConsiderationPageTableContentRows.querySelectorAll('tr')

    inputAreas = row.querySelectorAll(".inputArea")

    allRows.forEach(r => {
        r.style.border = 'none'
    })

    if(row === selectedConsideredRow){
        row.style.border = 'none'
        selectedConsideredRow = null
        selectedConsideredID = ""
        companyConsiderationPageUnselectCompanyButton.style.display = "none"
        companyConsiderationPageSelectCompanyButton.style.display = "flex"
    }
    else{
        row.style.border = '3px blue solid'
        selectedConsideredRow = row
        selectedConsideredID = row.dataset.id

        const items = readJsonFile("items.json")
        const item = items.find(obj => obj.requestedItemID == selectedItemID)

        if (row.dataset.id == item.chosenCompanyID){
            companyConsiderationPageSelectCompanyButton.style.display = "none"
            companyConsiderationPageUnselectCompanyButton.style.display = "flex"
        }
        else{
            companyConsiderationPageUnselectCompanyButton.style.display = "none"
            companyConsiderationPageSelectCompanyButton.style.display = "flex"
        }
    }
})

//Adding the functionality to remove a considered company from the list of companies--------------------------------------------------------------------------------------
const companyConsiderationPageRemoveCompanyButton = document.querySelector('#companyConsiderationPageRemoveCompanyButton')
const removeCompanyForm = document.querySelector('#removeCompanyForm')

companyConsiderationPageRemoveCompanyButton.addEventListener('click', () => {
    if (selectedConsideredID == ""){
        return
    }

    companyConsiderationPage.style.display = "none"
    removeCompanyForm.style.display = "flex"
})

const cancelRemovalOfCompanyButton = document.querySelector('#cancelRemovalOfCompanyButton')

cancelRemovalOfCompanyButton.addEventListener('click', (e) => {
    e.preventDefault()
    removeCompanyForm.style.display = "none"
    companyConsiderationPage.style.display = "flex"
})

const removeCompanyButton = document.querySelector('#removeCompanyButton')

removeCompanyButton.addEventListener('click', (e) => {
    e.preventDefault()

    inputAreas.forEach(input => {
        input.value=""
        localStorage.removeItem(input.id)
    })

    const items = readJsonFile('items.json')
    const item = items.find(obj => obj.requestedItemID == selectedItemID)
    const consideredCompanies = item.pendingCompanies.filter(obj => obj.supplierNumber != selectedConsideredID)

    item.pendingCompanies = consideredCompanies
    const newItems = items.filter(obj => obj.requestedItemID != selectedItemID)
    newItems.push(item)

    const sortedNewItems = sortItems(newItems)
    writeDataToJsonFile('items.json', sortedNewItems)

    loadConsideredSuppliersTable()

    removeCompanyForm.style.display = "none"
    companyConsiderationPage.style.display = "flex"
})

// Selecting the winning considered company------------------------------------------------------------------------------------------------------------------------
const companyConsiderationPageSelectCompanyButton = document.querySelector('#companyConsiderationPageSelectCompanyButton')

companyConsiderationPageSelectCompanyButton.addEventListener('click', () => {
    if (selectedConsideredID == ""){
        return
    }

    const items = readJsonFile("items.json")

    const otherItems = items.filter(obj => obj.requestedItemID != selectedItemID)

    const item = items.find(obj => obj.requestedItemID == selectedItemID)

    const selectedCompany = item.pendingCompanies.find(obj => obj.supplierNumber == selectedConsideredID)

    item.chosenCompany = selectedCompany.supplierName
    item.chosenCompanyID = selectedCompany.supplierNumber

    companyConsiderationPageSelectCompanyButton.style.display = "none"
    companyConsiderationPageUnselectCompanyButton.style.display = "flex"

    otherItems.push(item)

    const sortedItems = sortItems(otherItems)

    writeDataToJsonFile("items.json", otherItems)

    loadRequestTable(sortedItems)

    const allRows = companyConsiderationPageTableContentRows.querySelectorAll('tr')

    let num = 0
    allRows.forEach(row => {
        num+=1

        if (num%2 == 0){
            row.style.background = "hsl(0 0% 0%/ 0.2)"
        }
        else{
            row.style.background = "white"
        }

        if (row.dataset.id == selectedConsideredID){
            row.style.background = "hsl(93, 92%, 54%)"
        }
    })

    loadConsideredSuppliersTable()
})

//Unselecting the winning considered company-----------------------------------------------------------------------------------------------------------------------
companyConsiderationPageUnselectCompanyButton.addEventListener('click', () => {
    const items = readJsonFile("items.json")
    const otherItems = items.filter(obj => obj.requestedItem != selectedItemID)
    const item = items.find(obj => obj.requestedItemID == selectedItemID)

    item.chosenCompany = "pending"
    item.chosenCompanyID = ""

    const allRows = companyConsiderationPageTableContentRows.querySelectorAll('tr')

    let num = 0
    allRows.forEach(row => {
        num+=1

        if (num%2 == 0){
            row.style.background = "hsl(0 0% 0%/ 0.2)"
        }
        else{
            row.style.background = "white"
        }
    })

    otherItems.push(item)

    const sortedItems = sortItems(otherItems)

    companyConsiderationPageUnselectCompanyButton.style.display = "none"
    companyConsiderationPageSelectCompanyButton.style.display = "flex"

    writeDataToJsonFile("items.json", otherItems)

    loadRequestTable(sortedItems)

    loadConsideredSuppliersTable()    
})

//Searching on the browseSuppliers Page-----------------------------------------------------------------------------------------------------------------------------------
const Fuse = require("fuse.js")

const suppliers = readJsonFile("suppliers.json")

const searchBox = document.querySelector("#searchBox")
const resultsBox = document.querySelector("#results")

searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase().trim()
    resultsBox.innerHTML = ""

    if (query.length === 0) {
        resultsBox.style.display = "none"
        loadSuppliersTable(suppliers)
        return
    }

    // const matches = suppliers.filter(s =>
    //     s.supplierName.toLowerCase().includes(query) ||
    //     s.status.toLowerCase().includes(query) ||
    //     s.supplierNumber.toLowerCase().includes(query) ||
    //     s.services.toLowerCase().includes(query) ||
    //     s.streetAddress1.toLowerCase().includes(query) ||
    //     s.streetAddress2.toLowerCase().includes(query) ||
    //     s.streetAddress3.toLowerCase().includes(query) ||
    //     s.city.toLowerCase().includes(query)
    // )

    const options = {
        keys: ["supplierName","status","supplierNumber","services","streetAddress1","streetAddress2","streetAddress3","city"],
        threshold: 0
    }

    const fuse = new Fuse(suppliers, options);

    const results = fuse.search(query);

    const matches = results.map(r => r.item)

    if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement("div")

            div.style.display = "flex"
            div.style.justifyContent = "flex-start"
            div.style.alignItems = "center"
            div.style.width = "100%"
            div.style.padding = "2% 0% 2% 1%"

            // Find which field matched and show that value
            const fields = [
                "supplierName",
                "status",
                "supplierNumber",
                "services",
                "streetAddress1",
                "streetAddress2",
                "streetAddress3",
                "city"
            ]

            let suggestion = ""
            for (let field of fields) {
                if (match[field] && match[field].toLowerCase().includes(query)) {
                    suggestion = match[field]
                    break
                }
            }

            div.textContent = suggestion || match.supplierName

            div.style.cursor = "pointer"

            div.addEventListener("click", () => {
                searchBox.value = div.textContent
                resultsBox.style.display = "none"
            })

            div.addEventListener("mouseover", () => {
                div.style.background = "rgb(55, 114, 241)"
            })

            div.addEventListener("mouseout", () => {
                div.style.background = "white"
            })

            resultsBox.appendChild(div);
        })

        resultsBox.style.display = "flex"
    } 
    else {
        resultsBox.style.display = "none"
    }

    loadSuppliersTable(matches)
})

document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchContainer")) {
        resultsBox.style.display = "none"
    }
})

//Searching on the browseSuppliers Page-----------------------------------------------------------------------------------------------------------------------------------
const item_suppliers = readJsonFile("suppliers.json")

const item_searchBox = document.querySelector("#item_searchBox")
const item_resultsBox = document.querySelector("#item_results")

item_searchBox.addEventListener("input", () => {
    const query = item_searchBox.value.toLowerCase().trim()
    item_resultsBox.innerHTML = ""

    if (query.length === 0) {
        item_resultsBox.style.display = "none"
        loadItemSuppliersTable(item_suppliers)
        return
    }

    // const matches = item_suppliers.filter(s =>
    //     s.supplierName.toLowerCase().includes(query) ||
    //     s.status.toLowerCase().includes(query) ||
    //     s.supplierNumber.toLowerCase().includes(query) ||
    //     s.services.toLowerCase().includes(query) ||
    //     s.streetAddress1.toLowerCase().includes(query) ||
    //     s.streetAddress2.toLowerCase().includes(query) ||
    //     s.streetAddress3.toLowerCase().includes(query) ||
    //     s.city.toLowerCase().includes(query)
    // )

    const options = {
        keys: ["supplierName","status","supplierNumber","services","streetAddress1","streetAddress2","streetAddress3","city"],
        threshold: 0
    }

    const fuse = new Fuse(suppliers, options);

    const results = fuse.search(query);

    const matches = results.map(r => r.item)

    if (matches.length > 0) {
        matches.forEach(match => {
            const div = document.createElement("div")

            div.style.display = "flex"
            div.style.justifyContent = "flex-start"
            div.style.alignItems = "center"
            div.style.width = "100%"
            div.style.padding = "2% 0% 2% 1%"

            // Find which field matched and show that value
            const fields = [
                "supplierName",
                "status",
                "supplierNumber",
                "services",
                "streetAddress1",
                "streetAddress2",
                "streetAddress3",
                "city"
            ]

            let suggestion = ""
            for (let field of fields) {
                if (match[field] && match[field].toLowerCase().includes(query)) {
                    suggestion = match[field]
                    break
                }
            }

            div.textContent = suggestion || match.supplierName

            div.style.cursor = "pointer"

            div.addEventListener("click", () => {
                item_searchBox.value = div.textContent
                item_resultsBox.style.display = "none"
            })

            div.addEventListener("mouseover", () => {
                div.style.background = "rgb(55, 114, 241)"
            })

            div.addEventListener("mouseout", () => {
                div.style.background = "white"
            })

            item_resultsBox.appendChild(div)
        })

        item_resultsBox.style.display = "block"
    } 
    else {
        item_resultsBox.style.display = "none"
    }

    loadItemSuppliersTable(matches)
})

document.addEventListener("click", (e) => {
    if (!e.target.closest("#item_searchContainer")) {
        item_resultsBox.style.display = "none"
    }
})

function adjustRootFontSize() {
    const baseWidth = 1920; // your design width (change as needed)
    const baseFontSize = 16; // default root font size

    // scale proportionally with width
    let newFontSize = (window.innerWidth / baseWidth) * baseFontSize;

    // set a minimum and maximum size if you want
    newFontSize = Math.max(12, Math.min(newFontSize, 20));

    document.documentElement.style.fontSize = newFontSize + "px";
}

// Run on page load
window.addEventListener("load", adjustRootFontSize);

// Run on resize
window.addEventListener("resize", adjustRootFontSize);

// Initialization functions--------------------------------------------------------------------------------------------------------------------

function loadConsideredSuppliersTable(){
    if (selectedItemID == 0){
        return
    }

    companyConsiderationPageTableContentRows.innerHTML = ``

    const items = readJsonFile("items.json")

    item = items.find(obj => obj.requestedItemID == selectedItemID)

    consideredCompanies = item.pendingCompanies

    if (consideredCompanies != []){
        consideredCompanies.forEach(comp => {
            companyConsiderationPageTableContentRows.innerHTML += `
                <tr data-id = "${comp.supplierNumber}">
                    <td>${comp.supplierName}</td>
                    <td>${comp.telephone}</td>
                    <td>${comp.websiteAddress}</td>
                    <td><textarea type="text" id="receivedResponse${comp.supplierNumber}${selectedItemID}" class="inputArea textArea"></textarea></td>
                    <td><input type="text"  id="amount${comp.supplierNumber}${selectedItemID}" class="inputArea currency"></td>
                    <td><textarea type="text" id="remarks${comp.supplierNumber}${selectedItemID}" class="inputArea textArea"></textarea></td
                </tr>
            `
        })   
    }

    const allRows = companyConsiderationPageTableContentRows.querySelectorAll('tr')

    let num = 0
    allRows.forEach(row => {
        num+=1

        if (num%2 == 0){
            row.style.background = "hsl(0 0% 0%/ 0.2)"
        }
        else{
            row.style.background = "white"
        }

        if (row.dataset.id == item.chosenCompanyID){
            row.style.background = "hsl(93, 92%, 54%)"
        }
    })

    const inputs = companyConsiderationPageTableContentRows.querySelectorAll(".inputArea")

    // Ensuring any changes made to the considered companies input fields are saved
    inputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id)
        if (savedValue){
            input.value = savedValue
        }

        input.addEventListener("input", () => {
            localStorage.setItem(input.id, input.value)
        })
    })

    const currencyInputs = companyConsiderationPageTableContentRows.querySelectorAll(".currency")

    currencyInputs.forEach(input => {
        const savedValue = localStorage.getItem(input.id)
        if (!savedValue){
            input.value = "$"
        }

        input.addEventListener("blur", () => {
            let rawDigits = input.value.replace(/[^0-9.]/g, "")

            if (rawDigits){
                let number = parseFloat(rawDigits)

                if (!isNaN(number)) {
                    let formatted = number.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                    input.value = "$" + formatted;
                }
            }
            else{
                input.value = "$"
            }
        })
    })
}

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
                <td>${entry.chosenCompany}</td>
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