from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import json
import time
import os, sys

import sys

email = sys.argv[1]
password = sys.argv[2]
question = sys.argv[3]
answer = sys.argv[4]

# email = "agoopie-mohammed@energy.gov.tt"
# password = "v3w$t#Us"
# question = "Who was your favourite singer?"
# answer = "Neo"

BASE_URL = 'https://depository.oprtt.org'

REFRESH_INTERVAL = 15 * 60

supplier_numbers = []

def selenium_login():    
    options = Options()
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-features=AudioServiceOutOfProcess,SpeechRecognition")
    options.add_argument("--mute-audio")
    options.add_argument("--log-level=3")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)

    driver.get(f'{BASE_URL}/PublicBodyLOB/Prequalified?id=122')

    # Wait for login fields
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, 'UserName')))
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, 'Password')))

    username_field = driver.find_element(By.NAME, 'UserName')
    password_field = driver.find_element(By.NAME, 'Password')

    username_field.send_keys(email)
    password_field.send_keys(password)

    print("Please complete any CAPTCHA/2FA manually within 60 seconds...")
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "label[for='SecurityQuestion']"))
    )
    
    security_question_tag = driver.find_element(By.CSS_SELECTOR, "label[for='SecurityQuestion']")
    security_question = security_question_tag.text.strip()
    
    
    if security_question != question:
        driver.refresh()
    
        
    answer_field = driver.find_element(By.ID, "Answer")
    answer_field.send_keys(answer)
    
    button = driver.find_element(By.ID, "validate-question")
    button.click()
    
    print("Login successful!")
    
    # cookies = driver.get_cookies()

    # # Start headless driver
    # options.add_argument("--headless=new")
    # headless_driver = webdriver.Chrome(service=service, options=options)
    # headless_driver.get(BASE_URL)  # navigate to base URL first

    # # Add cookies to headless driver
    # for cookie in cookies:
    #     headless_driver.add_cookie(cookie)

    # headless_driver.get(f'{BASE_URL}/PublicBodyLOB/Prequalified?id=122')
    
    return driver

def get_soup(driver):
    return BeautifulSoup(driver.page_source, "lxml")

def fetch_lob_links(driver):
    driver.get(f'{BASE_URL}/PublicBodyLOB/Prequalified?id=122')
    soup = get_soup(driver)
    lob_div = soup.find('div', class_='col-md-12')
    lob_links = []
    for li in lob_div.find_all('li'):
        for a in li.find_all('a', href=True):
            lob_links.append(BASE_URL + a['href'])
    return lob_links

def fetch_company_links(driver, lob_url):
    driver.get(lob_url)
    soup = get_soup(driver)
    
    line_of_business_tag = soup.find('b', class_='pull-left')
    line_of_business = line_of_business_tag.text.strip() if line_of_business_tag else ''
    company_links = []
    statuses = []
    scores = []

    rows = soup.find_all('tr')
    for row in rows:
        link_tag = row.find('a', href=True)
        if not link_tag:
            continue
        company_links.append(BASE_URL + link_tag['href'])

        tds = row.find_all('td')
        if len(tds) > 2:
            statuses.append(tds[1].text.strip())
            scores.append(tds[2].text.strip())
        else:
            statuses.append('')
            scores.append('')

    return line_of_business, company_links, statuses, scores

def fetch_company_data(driver, company_url, line_of_business, status, score):
    driver.get(company_url)
    soup = get_soup(driver)

    card_body = soup.find("div", class_="card-body")
    if not card_body:
        return None

    cards = card_body.find_all("div", class_="col-md-6 col-12")
    if len(cards) < 4:
        return None

    details_link = BASE_URL + cards[0].div.a['href']
    address_link = BASE_URL + cards[3].div.a['href']
    services_tag = soup.find("li", class_="list-group-item")
    services = services_tag.p.text.strip() if services_tag else ""
    name_tag = soup.find("h3", class_="profile-username text-center")
    supplier_number_tag = soup.find("span", class_="text-muted")

    name = name_tag.text.strip() if name_tag else ""
    supplier_number = supplier_number_tag.text.strip() if supplier_number_tag else ""

    if not supplier_number or supplier_number in supplier_numbers:
        return None
    supplier_numbers.append(supplier_number)

    # Address page
    driver.get(address_link)
    soup_address = get_soup(driver)
    
    inner_table_body = soup_address.find("tbody")
    
    if inner_table_body:
        inner_row = inner_table_body.tr
        if inner_row:
            address_inner_link = BASE_URL + inner_row.a['href']
    else:
        inner_row = None
        address_inner_link = None
    
    if inner_table_body and inner_row and address_inner_link:
        driver.get(address_inner_link)
        soup_address_inner_link = get_soup(driver)
        
        address_details = {}
        for field in [
            "BuildingNm", "Street1Addr", "Street2Addr", "Street3Addr", "CityNm", 
            "GeographicLocationCd", "CountryCd", "PostalCd", "TelephoneNum", 
            "AddressTypeTp", "CreBy", "CreDttm"
        ]:
            input_tag = soup_address_inner_link.find("input", {"id": field})
            address_details[field] = input_tag["value"] if input_tag else ""

    else:
        address_details = {}
        for field in [
            "BuildingNm", "Street1Addr", "Street2Addr", "Street3Addr", "CityNm", 
            "GeographicLocationCd", "CountryCd", "PostalCd", "TelephoneNum", 
            "AddressTypeTp", "CreBy", "CreDttm"
        ]:
            address_details[field] = ""
        
    # Details page
    driver.get(details_link)
    soup_details = get_soup(driver)
    details = {}
    for field in [
        "SupplierNm", "SupplierTypeCd", "EmployeesQty", "NatureOfBusinessOrServicesTxt", 
        "FirmLegalNm", "Operated_Under_Other_Business_", "OtherBusinessNm", 
        "Subsidiary_Affiliate_Firm_", "AffiliatesNm", "Legal_Query_", 
        "LegalQueryDetailsTxt", "IncorporationYr", "IncorporationCountryCd", 
        "CompanyWebsiteUrl", "CreBy", "CreDttm"
    ]:
        input_tag = soup_details.find("input", {"id": field})
        details[field] = input_tag["value"] if input_tag else ""

    return {
        "SupplierName": details["SupplierNm"],
        "SupplierNumber": supplier_number,
        "Services": services,
        **address_details,
        **details,
        "LineofBusiness": line_of_business,
        "Status": status,
        "Score": score
    }
    
def main():
    driver = selenium_login()

    lob_links = fetch_lob_links(driver)
    opr_list = []
    
    def extract_companies_data(driver, lob_link):
        line_of_business, company_links, statuses, scores = fetch_company_links(driver, lob_link)
        
        allCompaniesData = []
        
        for idx, url in enumerate(company_links):
            data = fetch_company_data(driver, url, line_of_business, statuses[idx], scores[idx])
            if data:
                allCompaniesData.append(data)
            
        return allCompaniesData
    
   
    for lob_link in tqdm((lob_links), total=len(lob_links), desc=f'LOBs complete', bar_format="{l_bar}{bar} | {n_fmt}/{total_fmt} | Elapsed: {elapsed} | Remaining: {remaining}"):
        LOBresult = extract_companies_data(driver, lob_link)    
        opr_list.extend(LOBresult)
                
        with open("renderer/suppliers.json", "w", encoding="utf-8") as f:
            json.dump(opr_list, f, indent=4, ensure_ascii=False)
    
    print(f"\n\n Scraped {len(opr_list)} company records.")

if __name__ == "__main__":
    main()
