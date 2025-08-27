const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
requestedItemID = 0
selectedItemID = 0
selectedSupplierID = ""
selectedItemSupplierID = ""
selectedConsideredID = ""
chosenCompanyIDpairs = []
let currentPage = 1
let item_currentPage = 1
const rowsPerPage = 50

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
    data = readJsonFile("suppliers.json") 
    loadSuppliersTable(data)
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
const itemRequested = document.querySelector('#itemRequested')
const dateField = document.querySelector('#dateField')
const monthField = document.querySelector('#monthField')
const yearField = document.querySelector('#yearField')


entryFormCancelButton.addEventListener('click', () => {
    addEntryForm.style.display = 'none'
    requestedItemsPage.style.display = 'flex' 
})

//Adding an Item to the requestedItems database---------------------------------------------------------------------------------------
function submitRequestForm(e){
    e.preventDefault()

    const requestedItem = itemRequested.value.trim()
    const dateValue = dateField.value.trim()
    const monthValue = monthField.value.trim()
    const yearValue = yearField.value.trim()

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

    itemRequested.value = ""
    dateField.value = ""
    monthField.value = ""
    yearField.value = ""
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
    data = readJsonFile("suppliers.json")
    loadItemSuppliersTable(data)
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

    const supplier = suppliersData.find(obj => obj.SupplierNumber == selectedSupplierID)

    supplierHeaderName.innerText = supplier.SupplierName
    supplierDetailsPageSupplierNumber.innerText = supplier.SupplierNumber
    supplierDetailsPageServices.innerText = supplier.Services
    supplierDetailsPageBuildingName.innerText = supplier.BuildingNm
    supplierDetailsPageStreetAddress1.innerText = supplier.Street1Addr
    supplierDetailsPageStreetAddress2.innerText = supplier.Street2Addr
    supplierDetailsPageStreetAddress3.innerText = supplier.Street3Addr
    supplierDetailsPageCity.innerText = supplier.CityNm
    supplierDetailsPageSupplierType.innerText = supplier.SupplierTypeCd
    supplierDetailsPageEmployeesQuantity.innerText = supplier.EmployeesQty
    supplierDetailsPageNatureOfBusinessOrService.innerText = supplier.NatureOfBusinessOrServicesTxt
    supplierDetailsPageFirmLegalName.innerText = supplier.FirmLegalNm
    supplierDetailsPageOperatedUnderOtherBusiness.innerText = supplier.Operated_Under_Other_Business_
    supplierDetailsPageOtherBusinessName.innerText = supplier.OtherBusinessNm
    supplierDetailsPageSubsidiaryAffiliateFirm.innerText = supplier.Subsidiary_Affiliate_Firm_
    supplierDetailsPageAffiliatesName.innerText = supplier.affiliatesName
    supplierDetailsPageLegalQuery.innerText = supplier.Legal_Query_
    supplierDetailsPageLegalQueryDetails.innerText = supplier.LegalQueryDetailsTxt
    supplierDetailsPageIncorporationOrRegistrationYear.innerText = supplier.IncorporationYr
    supplierDetailsPageIncorporationOrRegistrationCountry.innerText = supplier.IncorporationCountryCd
    supplierDetailsPageWebsiteAddress.innerText = supplier.CompanyWebsiteUrl
    supplierDetailsPageMunicipality.innerText = supplier.GeographicLocationCd
    supplierDetailsPageCountry.innerText = supplier.CountryCd
    supplierDetailsPagePostalCode.innerText = supplier.PostalCd
    supplierDetailsPageTelephone.innerText = supplier.TelephoneNum
    supplierDetailsPageAddressType.innerText = supplier.AddressTypeTp
    supplierDetailsPageCreatedBy.innerText = supplier.CreBy
    supplierDetailsPageCreatedTimestamp.innerText = supplier.CreDttm
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

    const item_supplier = item_suppliersData.find(obj => obj.SupplierNumber == selectedItemSupplierID)

    item_supplierHeaderName.innerText = item_supplier.SupplierName
    item_supplierDetailsPageSupplierNumber.innerText = item_supplier.SupplierNumber
    item_supplierDetailsPageServices.innerText = item_supplier.Services
    item_supplierDetailsPageBuildingName.innerText = item_supplier.BuildingNm
    item_supplierDetailsPageStreetAddress1.innerText = item_supplier.Street1Addr
    item_supplierDetailsPageStreetAddress2.innerText = item_supplier.Street2Addr
    item_supplierDetailsPageStreetAddress3.innerText = item_supplier.Street3Addr
    item_supplierDetailsPageCity.innerText = item_supplier.CityNm
    item_supplierDetailsPageSupplierType.innerText = item_supplier.SupplierTypeCd
    item_supplierDetailsPageEmployeesQuantity.innerText = item_supplier.EmployeesQty
    item_supplierDetailsPageNatureOfBusinessOrService.innerText = item_supplier.NatureOfBusinessOrServicesTxt
    item_supplierDetailsPageFirmLegalName.innerText = item_supplier.FirmLegalNm
    item_supplierDetailsPageOperatedUnderOtherBusiness.innerText = item_supplier.Operated_Under_Other_Business_
    item_supplierDetailsPageOtherBusinessName.innerText = item_supplier.OtherBusinessNm
    item_supplierDetailsPageSubsidiaryAffiliateFirm.innerText = item_supplier.Subsidiary_Affiliate_Firm_
    item_supplierDetailsPageAffiliatesName.innerText = item_supplier.affiliatesName
    item_supplierDetailsPageLegalQuery.innerText = item_supplier.Legal_Query_
    item_supplierDetailsPageLegalQueryDetails.innerText = item_supplier.LegalQueryDetailsTxt
    item_supplierDetailsPageIncorporationOrRegistrationYear.innerText = item_supplier.IncorporationYr
    item_supplierDetailsPageIncorporationOrRegistrationCountry.innerText = item_supplier.IncorporationCountryCd
    item_supplierDetailsPageWebsiteAddress.innerText = item_supplier.CompanyWebsiteUrl
    item_supplierDetailsPageMunicipality.innerText = item_supplier.GeographicLocationCd
    item_supplierDetailsPageCountry.innerText = item_supplier.CountryCd
    item_supplierDetailsPagePostalCode.innerText = item_supplier.PostalCd
    item_supplierDetailsPageTelephone.innerText = item_supplier.TelephoneNum
    item_supplierDetailsPageAddressType.innerText = item_supplier.AddressTypeTp
    item_supplierDetailsPageCreatedBy.innerText = item_supplier.CreBy
    item_supplierDetailsPageCreatedTimestamp.innerText = item_supplier.CreDttm

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
    const supplier = suppliers.find(obj => obj.SupplierNumber == selectedItemSupplierID)

    const consideredCompanies = item.pendingCompanies

    consideredCompanies.forEach(comp => {
        if (comp.SupplierNumber == selectedItemSupplierID){
            duplicate = true
            return
        }
    })

    if (duplicate){
        console.log(item.SupplierName, " is already under consideration")
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
    const consideredCompanies = item.pendingCompanies.filter(obj => obj.SupplierNumber != selectedConsideredID)

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

    const selectedCompany = item.pendingCompanies.find(obj => obj.SupplierNumber == selectedConsideredID)

    item.chosenCompany = selectedCompany.SupplierName
    item.chosenCompanyID = selectedCompany.SupplierNumber

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
const { distance } = require("fastest-levenshtein")

const suppliers = readJsonFile("suppliers.json")

const searchBox = document.querySelector("#searchBox")
const resultsBox = document.querySelector("#results")

function levenshteinSentence(sentence, query){
    words = sentence.split(" ")

    for (word of words){
        if (distance(query, word) <= 2){
            return true
        }
    }

    return false
}

searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase().trim()
    resultsBox.innerHTML = ""

    if (query.length === 0) {
        resultsBox.style.display = "none"
        loadSuppliersTable(suppliers)
        return
    }

    const matches = suppliers.filter(s =>
        s.SupplierName.toLowerCase().includes(query) ||
        levenshteinSentence(s.SupplierName.toLowerCase(), query) ||

        s.Status.toLowerCase().includes(query) ||
        levenshteinSentence(s.Status.toLowerCase(), query) ||

        s.SupplierNumber.toLowerCase().includes(query) ||
        levenshteinSentence(s.SupplierNumber.toLowerCase(), query) ||

        s.Services.toLowerCase().includes(query) ||
        levenshteinSentence(s.Services.toLowerCase(), query) ||

        s.Street1Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street1Addr.toLowerCase(), query) ||

        s.Street2Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street2Addr.toLowerCase(), query) ||

        s.Street3Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street3Addr.toLowerCase(), query) ||

        s.CityNm.toLowerCase().includes(query) ||
        levenshteinSentence(s.CityNm.toLowerCase(), query)
    )

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
                "SupplierName",
                "Status",
                "SupplierNumber",
                "Services",
                "Street1Addr",
                "Street2Addr",
                "Street3Addr",
                "CityNm"
            ]

            let suggestion = ""
            for (let field of fields) {
                if (match[field] && (match[field].toLowerCase().includes(query) || levenshteinSentence(match[field].toLowerCase(), query))){
                    suggestion = match[field]
                    break
                }
            }

            div.textContent = suggestion || match.SupplierName

            div.style.cursor = "pointer"

            div.addEventListener("click", () => {
                searchBox.value = div.textContent
                resultsBox.style.display = "none"
            })

            div.addEventListener("mouseover", () => {
                div.style.background = "hsl(221 87% 58% / 0.5)"
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

//Searching on the item_browseSuppliers Page-----------------------------------------------------------------------------------------------------------------------------------
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

    const matches = item_suppliers.filter(s =>
        s.SupplierName.toLowerCase().includes(query) ||
        levenshteinSentence(s.SupplierName.toLowerCase(), query) ||

        s.SupplierNumber.toLowerCase().includes(query) ||
        levenshteinSentence(s.SupplierNumber.toLowerCase(), query) ||

        s.Services.toLowerCase().includes(query) ||
        levenshteinSentence(s.Services.toLowerCase(), query) ||

        s.Street1Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street1Addr.toLowerCase(), query) ||

        s.Street2Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street2Addr.toLowerCase(), query) ||

        s.Street3Addr.toLowerCase().includes(query) ||
        levenshteinSentence(s.Street3Addr.toLowerCase(), query) ||

        s.CityNm.toLowerCase().includes(query) ||
        levenshteinSentence(s.CityNm.toLowerCase(), query)
    )

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
                "SupplierName",
                "SupplierNumber",
                "Services",
                "Street1Addr",
                "Street2Addr",
                "Street3Addr",
                "CityNm"
            ]

            let suggestion = ""
            for (let field of fields) {
                if (match[field] && (match[field].toLowerCase().includes(query) || levenshteinSentence(match[field].toLowerCase(), query))){
                    suggestion = match[field]
                    break
                }
            }

            div.textContent = suggestion || match.SupplierName

            div.style.cursor = "pointer"

            div.addEventListener("click", () => {
                item_searchBox.value = div.textContent
                item_resultsBox.style.display = "none"
            })

            div.addEventListener("mouseover", () => {
                div.style.background = "hsl(221 87% 58% / 0.5)"
            })

            div.addEventListener("mouseout", () => {
                div.style.background = "white"
            })

            item_resultsBox.appendChild(div);
        })

        item_resultsBox.style.display = "flex"
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
                <tr data-id = "${comp.SupplierNumber}">
                    <td>${comp.SupplierName}</td>
                    <td>${comp.TelephoneNum}</td>
                    <td>${comp.CompanyWebsiteUrl}</td>
                    <td><textarea type="text" id="receivedResponse${comp.SupplierNumber}${selectedItemID}" class="inputArea textArea"></textarea></td>
                    <td><input type="text"  id="amount${comp.SupplierNumber}${selectedItemID}" class="inputArea currency"></td>
                    <td><textarea type="text" id="remarks${comp.SupplierNumber}${selectedItemID}" class="inputArea textArea"></textarea></td
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

const suppliersPreviousButton = document.getElementById("suppliersPreviousButton")
const suppliersNextButton = document.getElementById("suppliersNextButton")

suppliersPreviousButton.addEventListener("click", () => {
    prevPage()
})

suppliersNextButton.addEventListener("click", () => {
    const suppliers = readJsonFile('suppliers.json')
    nextPage(suppliers)
})

const item_suppliersPreviousButton = document.getElementById("item_suppliersPreviousButton")
const item_suppliersNextButton = document.getElementById("item_suppliersNextButton")

item_suppliersPreviousButton.addEventListener("click", () => {
    item_prevPage()
})

item_suppliersNextButton.addEventListener("click", () => {
    const suppliers = readJsonFile('suppliers.json')
    item_nextPage(suppliers)
})

// handle next/prev buttons
function nextPage(data) {
    if (currentPage < Math.ceil(data.length / rowsPerPage)) {
        const suppliers = readJsonFile('suppliers.json')
        currentPage++
        loadSuppliersTable(suppliers)
    }
}

function prevPage() {
    if (currentPage > 1) {
        const suppliers = readJsonFile('suppliers.json')
        currentPage--
        loadSuppliersTable(suppliers)
    }
}

// handle next/prev buttons
function item_nextPage(data) {
    if (item_currentPage < Math.ceil(data.length / rowsPerPage)) {
        const suppliers = readJsonFile('suppliers.json')
        item_currentPage++
        loadItemSuppliersTable(suppliers)
    }
}

function item_prevPage() {
    if (item_currentPage > 1) {
        const suppliers = readJsonFile('suppliers.json')
        item_currentPage--
        loadItemSuppliersTable(suppliers)
    }
}

function loadSuppliersTable(data) {
    browseSuppliersPageTableContentRows.innerHTML = ''

    // calculate slice indexes
    const start = (currentPage - 1) * rowsPerPage
    const end = start + rowsPerPage
    const chunk = data.slice(start, end)

    // build HTML
    let html = ''
    chunk.forEach(entry => {
        html += `
            <tr data-id="${entry.SupplierNumber}">
                <td>${entry.SupplierName}</td>
                <td>${entry.Status}</td>
                <td>${entry.TelephoneNum}</td>
                <td>${entry.CompanyWebsiteUrl}</td>
            </tr>
        `
    })
    browseSuppliersPageTableContentRows.innerHTML = html

    // update page info
    document.getElementById("suppliers-page-info").textContent =
        `Page ${currentPage} of ${Math.ceil(data.length / rowsPerPage)}`
}



function loadItemSuppliersTable(data){
    item_browseSuppliersPageTableContentRows.innerHTML = ''

    if (data != []){
        const start = (item_currentPage - 1) * rowsPerPage
        const end = start + rowsPerPage
        const chunk = data.slice(start, end)

        chunk.forEach(entry => {
            item_browseSuppliersPageTableContentRows.innerHTML += `
                <tr data-id = "${entry.SupplierNumber}">
                    <td>${entry.SupplierName}</td>
                    <td>${entry.Status}</td>
                    <td>${entry.TelephoneNum}</td>
                    <td>${entry.CompanyWebsiteUrl}</td>
                </tr>
            `
        })
    }

    // update page info
    document.getElementById("item_suppliers-page-info").textContent =
        `Page ${item_currentPage} of ${Math.ceil(data.length / rowsPerPage)}`
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
                    <button class="button">View</button>
                </td>
                <td>${entry.chosenCompany}</td>
            </tr>
        `
    })
}

const { ipcRenderer } = require('electron');

document.getElementById("updateDatabaseButton").addEventListener("click", () => {
    const email = document.getElementById("oprEmail").value;
    const password = document.getElementById("oprPassword").value;
    const question = document.getElementById("securityQuestionsDropdownMenu").value;
    const answer = document.getElementById("securityQuestionAnswer").value;

    ipcRenderer.send('run-python', { email, password, question, answer })

    // document.getElementById("oprEmail").value = ''
    // document.getElementById("oprPassword").value = ''
    // document.getElementById("securityQuestionAnswer").value = ''
});

document.addEventListener('DOMContentLoaded', () => {
    const suppliers = readJsonFile('suppliers.json')
    console.log(suppliers.length, ' companies')
    loadSuppliersTable(suppliers)
    loadItemSuppliersTable(suppliers)
    const items = sortItems(readJsonFile('items.json'))
    writeDataToJsonFile("items.json", items)
    loadRequestTable(items)
})