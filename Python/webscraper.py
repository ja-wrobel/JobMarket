from selenium import webdriver
from selenium.webdriver.common.by import By;
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from collections import defaultdict
from dotenv import load_dotenv
import datetime
import sys
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
load_dotenv()
server_port = os.environ['SERVER_PORT']
uri = os.environ['URI_DATABASE']
server_url = os.environ['SERVER_URL']
client = MongoClient(uri, server_api=ServerApi('1'))
db = client.offerData

"--------------COOKIES-----------"

cookie1 = {'name' : "gpc_v",'value' : "1"}
cookie2 = {'name' : "gp_ab__subservices__171",'value' : "1"}
cookie3 = {'name' : "gp_ab__basket__185", 'value' : "A"}

"---------------CHROME VARIABLES AND SETTINGS----------------"
position = sys.argv[1]
if position == "all":
    url_flag = False
    specs_arr = ['backend', 'frontend', 'fullstack', 'gamedev']
else:
    url_flag = True
    url = f'https://it.pracuj.pl/praca?et=17%2C1&its={position}'
options = webdriver.ChromeOptions()
options.add_argument("--enable-javascript")
options.add_argument("--headless")
prefs = {"profile.default_content_setting_values.geolocation" :2}
options.add_experimental_option("prefs",prefs)
browser = webdriver.Chrome(options=options)
errors = [NoSuchElementException, ElementNotInteractableException]
wait = WebDriverWait(browser, timeout=10, poll_frequency=.5, ignored_exceptions=errors)

"---------------GLOBAL VARIABLES-------------------"
idArr = defaultdict(list)
technologiesArr = defaultdict(list)
technologiesCount = defaultdict(int)

"--------------SEARCH FUNCTIONS----------------"

def browser_setting(spec):
    browser.get("https://pracuj.pl/")
    browser.add_cookie(cookie3)
    url_arg = f'https://it.pracuj.pl/praca?et=17%2C1&its={spec}'
    browser.get(url_arg)
    browser.add_cookie(cookie1)
    browser.add_cookie(cookie2)
    browser.refresh()

def main(techArr, IDArr, position):
    try:
        offersArr = browser.find_elements(By.XPATH, '//*//div[@data-test="default-offer"]')
        for i, e in enumerate(offersArr):
            att = e.get_attribute("data-test-offerid")
            IDArr[i].append(att)
            lookForTechnologies(att, i, techArr)
    except NoSuchElementException:
        print("404")
        exit()
    finally:
        length = len(db.lastUpdateTime.find({"type": position}).distinct("_id"))
        db.lastUpdateTime.insert_one({"date": datetime.datetime.now(tz=datetime.timezone.utc), "_id": length+1, "type": position})

def lookForTechnologies(id, index, arr):
    """
    Scrapes data from offer found by ID into array given as parameter
    
    Parameters:
        id (int|string): id of offer
        index (int): index of this offer in ID array
        arr (defaultdict): [Any, list] - Scraped data goes here
    """
    result = browser.find_elements(By.XPATH, f"//*/div[@data-test-offerid='{id}']//*//span[@data-test='technologies-item']")
    for e in result:
        data = e.get_attribute("innerHTML")
        arr[index].append(data)
    if not result:
        arr[index].append('-')

flag = False
"This flag controls for loop's behaviour, checks whether ID or TECH already exists in array"

def add_new_id(IDArr, techArr):
    for k, id in IDArr.items():
        flag = False
        for mongoID in db.ids.distinct("ID"):
            if id[0] == mongoID:
                techArr.pop(k)
                flag = True
                break
        if flag == False:
            db.ids.insert_one({"ID": id[0], "date": datetime.datetime.now(tz=datetime.timezone.utc)})

def count(techArr, techCount):
    for k, v in techArr.items():
        for e in v:
            techCount[e] += 1

def printAsJSON(techCount, IDArr):
    i = 0
    length = len(techCount)
    for k, v in techCount.items():
        ReactKey = IDArr[0][0]+str(i)
        if ( i + 1 ) != length:
            print(f'\u007b"_id":"{ReactKey}","name":"{k}","value":"{v}"\u007d,')
        else:
            print(f'\u007b"_id":"{ReactKey}","name":"{k}","value":"{v}"\u007d')
        i += 1

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
            elif k == "-":
                flag = True
                break
        if flag == False:
            db[spec].insert_one({"name": k, "value": v})

"---------------EXECUTION----------------"

if url_flag == False:
    i = 0
    for v in specs_arr:
        flag = True
        browser_setting(v)
        techArr = defaultdict(list)
        IDArr = defaultdict(list)
        techCount = defaultdict(int)
        main(techArr, IDArr, v)
        add_new_id(IDArr, techArr)
        count(techArr, techCount)
        if i == 0:
            print(f'\u007b "{v}": [')
        else:
            print(f']\u007d, \u007b "{v}": [')
        printAsJSON(techCount, IDArr)
        
        addTechs("langsCount", techCount)
        addTechs(v, techCount)
        i += 1
    print("]\u007d")
    exit()
else:
    browser_setting(position)
    main(technologiesArr, idArr, position)
    add_new_id(idArr, technologiesArr)
    count(technologiesArr, technologiesCount)
    
    printAsJSON(technologiesCount, idArr)
    
    addTechs("langsCount", technologiesCount)
    addTechs(position, technologiesCount)
    exit()
