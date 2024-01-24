from selenium import webdriver
from selenium.webdriver.common.by import By;
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from collections import defaultdict
from dotenv import load_dotenv
import time
import re
import sys
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
load_dotenv()
uri = os.environ['URI_DATABASE']
client = MongoClient(uri, server_api=ServerApi('1'))
db = client.offerData
"""
"--------------NOTES---------------"
"""
"--------------COOKIES-----------"

cookie1 = {'name' : "gpc_v",'value' : "1"}
cookie2 = {'name' : "gp_ab__subservices__171",'value' : "1"}
cookie3 = {'name' : "gp_ab__basket__185", 'value' : "A"}

"---------------CHROME VARIABLES AND SETTINGS----------------"
position = sys.argv[1]
if position == "all":
    url_flag = False
    url = []
    url.append('backend')
    url.append('frontend')
    url.append('fullstack')
    url.append('gamedev')
else:
    url_flag = True
    url = f'https://it.pracuj.pl/praca?et=17%2C1&its={position}'
browser = webdriver.Chrome()
options = webdriver.ChromeOptions()
options.add_argument("--enable-javascript")
options.add_argument("--headless")
prefs = {"profile.default_content_setting_values.geolocation" :2}
options.add_experimental_option("prefs",prefs)
browser = webdriver.Chrome(options=options)
errors = [NoSuchElementException, ElementNotInteractableException]
wait = WebDriverWait(browser, timeout=2, poll_frequency=.2, ignored_exceptions=errors)

"///---------------USE WAIT INSTEAD----------------///"
time.sleep(3)

"---------------GLOBAL VARIABLES-------------------"
idArr = defaultdict(list)
offerNameArr= defaultdict(list)
placementArr = defaultdict(list)
positionArr = defaultdict(list)
technologiesArr = defaultdict(list)
linkArr = defaultdict(list)
salaryArr = defaultdict(list)
"Some of dict's are here for future improvement"
technologiesCount = defaultdict(int)
newDict = defaultdict(list)



"--------------SEARCH FUNCTIONS----------------"

def lookForTechnologies(id, index, arr):
    result = browser.find_elements(By.XPATH, f"//*/div[@data-test-offerid='{id}']//*//span[@data-test='technologies-item']")
    for e in result:
        data = e.get_attribute("innerHTML")
        arr[index].append(data)
        print(data)
    if not result:
        arr[index].append('not given')
        print('No Technologies found\n')
    else:
        print('Technologies added succesfully\n')

def pop(index):
    idArr.pop(index)
    offerNameArr.pop(index)
    positionArr.pop(index)
    placementArr.pop(index)
    linkArr.pop(index)
    technologiesArr.pop(index)
    salaryArr.pop(index)


"---------------VALIDATING FUNCTIONS---------------"

def sortByPosition():
    if position == 'gamedev':
        return
    for i in range(0, len(positionArr)):
        if "Mid" in positionArr[i][0]:
            pop(i)

def validateSalaries():
    for k, v in salaryArr.items():
        for e in v:
            if e != 'not given':
                new = re.sub(r'&nbsp;|/.*', "", e)
                newDict[k].append(new)
            else:
                newDict[k].append('not given')

" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ "

def count(techArr, techCount):
    for k, v in techArr.items():
        for e in v:
            techCount[e] += 1
    print(techCount)

"---------------EXECUTION----------------"
def browser_setting(spec):
    browser.get("https://pracuj.pl/")
    browser.add_cookie(cookie3)
    url_arg = f'https://it.pracuj.pl/praca?et=17%2C1&its={spec}'
    print(url_arg)
    browser.get(url_arg)
    browser.add_cookie(cookie1)
    browser.add_cookie(cookie2)
    time.sleep(1)
    browser.refresh()
    time.sleep(3)

def main(techArr, IDArr):
    try:
        offersArr = browser.find_elements(By.XPATH, '//*//div[@data-test="default-offer"]')
        for i, e in enumerate(offersArr):
            att = e.get_attribute("data-test-offerid")
            print('------------')
            IDArr[i].append(att)
            print(f'ID: {att} added succesfully\n')
            lookForTechnologies(att, i, techArr)
            """
            lookForLink(att, i)
            """
    except NoSuchElementException:
        pass

flag = False
"This flag controls for loop's behaviour, checks whether ID or TECH already exists in array"

def add_new_id(IDArr, techArr):
    for k, id in IDArr.items():
        flag = False
        for mongoID in db.IDs.distinct("ID"):
            if id[0] == mongoID:
                techArr.pop(k)
                flag = True
                break
        if flag == False:
            db.IDs.insert_one({"ID": id[0]})


def addTechs(spec, techCount):
    for k, v in techCount.items():
        flag = False
        for mongoName in db[spec].distinct("name"):
            if k == mongoName:
                val = db[spec].find({"name": k}).distinct('value')
                val = val[0]
                val = int(val)
                summary = v+val
                db[spec].update_one({"name": k}, {"$set": {"value": summary}})
                flag = True
                break
            elif k == "not given":
                flag = True
                break
        if flag == False:
            db[spec].insert_one({"name": k, "value": v})



if url_flag == False:
    for v in url:
        flag = True
        browser_setting(v)
        techArr = defaultdict(list)
        IDArr = defaultdict(list)
        techCount = defaultdict(int)
        main(techArr, IDArr)
        add_new_id(IDArr, techArr)
        count(techArr, techCount)
        addTechs("langsCount", techCount)
        addTechs(v, techCount)
        browser.get(f'http://localhost:8080/set_upd_time/{v}')
    time.sleep(1)
    exit()
else:
    browser_setting(position)
    main(technologiesArr, idArr)
    add_new_id(idArr, technologiesArr)
    count(technologiesArr, technologiesCount)
    addTechs("langsCount", technologiesCount)
    addTechs(position, technologiesCount)
    browser.get(f'http://localhost:8080/set_upd_time/{position}')   
    time.sleep(1)
    exit()