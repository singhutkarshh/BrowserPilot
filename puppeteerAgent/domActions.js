const { delay } = require('./helpers');
  
async function getObjectId(originalId, currentElements, page) { 

    const element = currentElements[originalId];  
    
    await delay(1000);
    
    let attributes = {};  
    for (let attr of element?.attributes) { // get the attributes  
    attributes[attr.name] = attr.value;  
    }  

    await delay(500);

    let selector = element.tagName;  
    let specificAttributes = ['name', 'class', 'role', 'id']; // Specify the attributes you care about  
      
    for (let key in attributes) {  
      if (specificAttributes.includes(key)) {  
        let value = attributes[key];  
        if (value) {  
          value = value.replace(/"/g, '\\"'); // Escape any quotes in the attribute value  
          selector += `[${key}="${value}"]`;  
        } else {  
          selector += `[${key}]`;  
        }  
      }  
    }  

    await delay(500);
    // console.log('selector', selector);
      
    const elementHandle = await page.$(selector);  
    
    await delay(1000);

    if (!elementHandle) {  
        throw new Error('Could not find node');  
    }  
  
    return elementHandle;  
}  
  
async function scrollIntoView(elementHandle) {  

    await elementHandle.evaluate(el => el.scrollIntoView()); 
     
    await delay(500);  
}  
  
async function getCenterCoordinates(elementHandle, page) {  
    const box = await elementHandle.boundingBox();  
    await delay(500);
    const centerX = box.x + box.width / 2;  
    const centerY = box.y + box.height / 2;  
  
    return { x: centerX, y: centerY };  
}  
  
async function clickAtPosition(x, y,  page, clickCount = 1) {   
    // click  
    await page.mouse.click(x, y, { clickCount });  
    await delay(500);
}  
  
async function click(payload, page, currentElements) {  
    const elementHandle = await getObjectId(payload.elementId, currentElements, page);  
   
    await delay(1000);
    await scrollIntoView(elementHandle);  
    await elementHandle.click(),  
    await delay(500);
      
    // const { x, y } = await getCenterCoordinates(elementHandle, page);  
    // await clickAtPosition(x, y, page);  
}  

  
async function selectAllText(x, y, page) {  
    await clickAtPosition(x, y, page, 3); 
    await delay(500); 
}  
  
async function typeText(text, page) {  
    for (const char of text) {  
        await page.keyboard.type(char, { delay: 100 });  
    }  
    await delay(500);
}  
  
async function blurFocusedElement(page) {  
    await page.evaluate(() => {  
        if (document.activeElement) {  
            document.activeElement.blur();  
        }  
    });  
    await delay(500);
}  
  
async function setValue(payload, page, currentElements) {  
    const elementHandle = await getObjectId(payload.elementId, currentElements, page);  
    await delay(1000);
    await scrollIntoView(elementHandle, page);  
   
    await  delay(500);
    const { x, y } = await getCenterCoordinates(elementHandle, page);  
  
    await selectAllText(x, y, page);
    
    await delay(500);
    await typeText(payload.value, page); 
    await delay(500); 
    // blur the element    
    await blurFocusedElement(page);  
    await delay(500);
}  

async function navigate(payload, page, currentElements) {  
    console.log('navigating to', payload);
    await page.goto(payload.url);  
    await delay(1000);
}
  
const domActions = {  
    click,  
    setValue,  
    navigate,
};  
  
async function callDOMAction(type, payload, page, currentDom, currentElements) {  
    await domActions[type](payload, page, currentElements);  
    await delay(1000);
};  
  
module.exports = {  
    domActions,  
    callDOMAction  
};
