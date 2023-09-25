// Create an array to store extracted data from each URL
var extractedDataArray = [];

// Define the maximum number of windows to open
var maxWindowCount = 5;

// Function to parse the main page for coupon cards
async function parseMainPageForCouponCards() {
  console.log(1)
  const couponCards = document.querySelectorAll('.nodesListItem');
  const couponURLs = Array.from(couponCards, card =>
    card.querySelector('a.node').getAttribute('href')
  );

  // Use Promise.all to process the URLs with a maximum concurrency of maxWindowCount
  await Promise.all(
    couponURLs.slice(0, maxWindowCount).map(async couponURL => {
      console.log(2)
      const data = await openAndExtractData(couponURL);
      extractedDataArray.push(data);
    })
  );

  // Create a single JSON file with all data
  createJSONFile(extractedDataArray);
}
function waitForPopupLoad(popupWindow) {
  return new Promise(resolve => {
    popupWindow.addEventListener('load', () => {
      resolve();
    });
  });
}
// Function to open a URL in a new window and extract data
async function openAndExtractData(couponURL) {
  const popupWindow = window.open(couponURL, '_blank');
console.log(3)
  try {
    // Wait for the popup window's document to fully load
    await waitForPopupLoad(popupWindow);    // Extract and return the data
    const data = await extractDataFromWindow(popupWindow, couponURL); // Pass couponURL as an argument
    console.log(3.0)
      
    // Wait for a certain condition (e.g., window closed) or a timeout
    await waitForWindowClose(popupWindow);
console.log(data)



    return data;
  } catch (error) {
    console.error('Error in openAndExtractData:', error);
    return null; // Handle the error gracefully
  }
}

// Function to wait for a window to close
function waitForWindowClose(window) {
  console.log(4)
  return new Promise(resolve => {
    
      if (window.closed) {
        //clearInterval(checkInterval);
        resolve();
      }else{
        //popupWindow.close();
      }
    
  });
}

// Function to extract data from a window
async function extractDataFromWindow(window, couponURL) {
  return await extractAndLogInfo(window, couponURL); // Pass couponURL as an argument
console.log(5)
}

// Function to extract data and log it
async function extractAndLogInfo(popupWindow, couponURL) {
  // Extract data from the new window's document
  console.log(popupWindow)
  var rebateElement = popupWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--highlight');
console.log(6 + rebateElement)
  if (rebateElement) {
    // Extract the content of the rebate element
    var rebateAmount = rebateElement.innerText.trim();
  }
console.log(popupWindow.document)
  var brandNameElement = popupWindow.document.querySelector('.heading-block-title');
  var offerTitleElement = popupWindow.document.querySelector('.details-informations-title');
  var offerTermsElement = popupWindow.document.querySelector('.Offers-DetailsBlock__content p');
  var offerEndTimeElement = popupWindow.document.querySelector('.node_status__offer_details.time.offer-end');
  var descriptionElement = popupWindow.document.querySelector('.heading-block-description.current');
  var buyElement = popupWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--after');

  // Check if elements exist and extract their content
  var brandName = brandNameElement ? brandNameElement.textContent.trim() : '';
  var offerTitle = offerTitleElement ? offerTitleElement.textContent.trim() : '';
  var offerTerms = offerTermsElement ? offerTermsElement.textContent.trim() : '';
  var offerEndTime = offerEndTimeElement ? offerEndTimeElement.textContent.trim() : '';
  var description = descriptionElement ? descriptionElement.textContent.trim() : '';
  var buyInfo = buyElement ? buyElement.innerText.trim() : '';
  var restrictions = getRestrictionsPopup(popupWindow.document);

  // Create an object to store the extracted data
  var couponData = {
    rebateAmount,
    brandName,
    offerTitle,
    offerTerms,
    offerEndTime,
    description,
    buyInfo,
    restrictions,
    couponURL // Include the couponURL in the data
  };

  // Push the data into the array
  extractedDataArray.push(couponData);

  // Save the data as JSON (you can modify this part to save data as needed)
  var jsonData = JSON.stringify(couponData);
  console.log(jsonData);

  // Check if all URLs have been processed
  if (extractedDataArray.length === maxWindowCount) {
    // All URLs have been processed, create a single JSON file with all data
    createJSONFile(extractedDataArray);
  }

  // After data extraction is complete, call the callback function
  //return extractedDataArray;
  popupWindow.close(extractedDataArray);
}

// Function to create a single JSON file with all data
function createJSONFile(dataArray) {
  console.log(7)
  
  // Convert the array of extracted data to a JSON string
  var jsonData = JSON.stringify(dataArray);

  // Create a Blob from the JSON string
  var blob = new Blob([jsonData], { type: 'application/json' });

  // Create a URL for the Blob
  var url = URL.createObjectURL(blob);

  // Create a download link for the JSON file
  var a = document.createElement('a');
  a.href = url;
  a.download = 'extracted_data.json';

  // Trigger a click event on the download link to initiate the download
  a.click();
}

function getRestrictionsPopup(doc){
  // Assuming you have a reference to the popup element
  var popupElement = doc.querySelector('.webPopup.warningPopup');

  if (popupElement) {
    // Find the message element within the popup
    var messageElement = popupElement.querySelector('.webPopup-message p');

    if (messageElement) {
      // Extract the text content of the message element
      var popupText = messageElement.textContent.trim();
    
      // Log or use the extracted text as needed
      return popupText;
    }
  }
}

parseMainPageForCouponCards();
