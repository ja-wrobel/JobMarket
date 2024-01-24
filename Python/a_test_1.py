from selenium import webdriver
from selenium.webdriver.common.by import By;
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
from collections import defaultdict
import time

browser = webdriver.Chrome()
options = webdriver.ChromeOptions()
options.add_argument("--enable-javascript")
browser = webdriver.Chrome(options=options)
errors = [NoSuchElementException, ElementNotInteractableException]
wait = WebDriverWait(browser, timeout=2, poll_frequency=.2, ignored_exceptions=errors)
actions = ActionChains(browser)



def puppeteer_testing():
    errors_counter = 0
    not_found_counter = 0
    found_counter = 0
    summary_count = 0
    ul = browser.find_elements(By.CSS_SELECTOR, 'li')
    for li in ul:
        browser.execute_script("arguments[0].scrollIntoView();", li)
        time.sleep(0.4)
        actions.move_to_element(li).perform()
        WebDriverWait(browser, 10).until(lambda x: x.find_element(By.ID, f'{li.get_attribute("id")}').is_displayed())
        li.click()
        WebDriverWait(browser, timeout=35, ignored_exceptions=errors).until_not(lambda browser: browser.find_element(By.CLASS_NAME, 'load'))
        info = defaultdict(list)
        title = browser.find_element(By.ID, 'info_tab_title').get_attribute("innerHTML")
        info['title'].append(title)
        error_message = browser.find_element(By.ID, 'error').get_attribute("innerHTML")
        info['error'].append(error_message)
        if info['error'] != ['']:
            errors_counter += 1
        try:
            first_paragraph = browser.find_element(By.ID, 'info_tab_content')
            info['content'].append(first_paragraph.get_attribute("innerText"))
            if info['content'] == ["Couldn't find article related to this subject..."]:
                not_found_counter += 1
            else:
                found_counter += 1
        except NoSuchElementException:
            info['content'].append('No such element exception..')
            not_found_counter += 1
            pass
        for key, val in info.items():
            print(f"{key}: {val}")
        print("---------------------------------------------")
        summary_count += 1
    print(f"Errors: {errors_counter}")
    print(f"Found articles: {found_counter}")
    print(f"Not found articles: {not_found_counter}")
    print(f"In summary: {summary_count}")
    print("---------------------------------------------")

"""def"""

browser.get("http://localhost:5173/")
time.sleep(3)
puppeteer_testing()
