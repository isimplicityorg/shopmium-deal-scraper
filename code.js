// Define the maximum number of windows to open at once
var maxWindowsOpen = 1;

// Define the maximum number of cards to parse
var maxCardsToParse = 5; // Change this value as needed

// Track the number of open windows
var openWindowCount = 0;

// Create an array to store extracted data from each URL
var extractedDataArray = [];

// for now, you can only have one or the other options
outputOptionDumpAllData = false;
outputOptionDbData = true;

// Function to parse the main page for coupon cards
async function parseMainPageForCouponCards() {
  const couponCards = document.querySelectorAll('.nodesListItem');
  const couponURLs = Array.from(couponCards, card =>
    card.querySelector('a.node').getAttribute('href')
  );

  // Use Promise.all to process the URLs
  await Promise.all(
    couponURLs.slice(0, maxCardsToParse).map(async couponURL => {
      // Check if the maximum number of open windows is reached
      if (openWindowCount >= maxWindowsOpen) {
        // Wait for a window to close before opening a new one
        await waitForOpenWindow();
      }

      const data = await openAndExtractData(couponURL);
      console.log("Promise.all " + data);
    })
  );

  // Create a single JSON file with all data
  createJSONFile(extractedDataArray);
}

// Function to wait for an open window to close
async function waitForOpenWindow() {
  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (openWindowCount < maxWindowsOpen) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);
  });
}

// Function to open a URL in a new window and extract data
async function openAndExtractData(couponURL) {
  const popupWindow = window.open(couponURL, '_blank');
  openWindowCount++;

  try {
    // Wait for the popup window's document to fully load
    await waitForPopupLoad(popupWindow);

    // Extract and return the data
    const data = await extractDataFromWindow(popupWindow, couponURL);

    // Wait for a certain condition (e.g., window closed) or a timeout
    await waitForWindowClose(popupWindow);

    // Close the popup window
    popupWindow.close();
    openWindowCount--;

    return data;
  } catch (error) {
    console.error('Error in openAndExtractData:', error);
    openWindowCount--; // Decrement the open window count on error
    return null; // Handle the error gracefully
  }
}

// Rest of the code remains the same...


// Function to wait for a window to close
function waitForWindowClose(window) {
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
}

// Function to extract data and log it
async function extractAndLogInfo(popupWindow, couponURL) {
  // Extract data from the new window's document
  var rebateElement = popupWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--highlight');
  if (rebateElement) {
    // Extract the content of the rebate element
    var rebateAmount = rebateElement.innerText.trim();
  }
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

  if(outputOptionDumpAllData == true){
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
  }
  if(outputOptionDbData == true)
    {
couponData = {
      cashBack: rebateAmount,
      offerName: offerTitle,
      offerDetails: description,
      expiration: offerEndTime,
      insertDate: "DIGITAL",
      insertId: "SHOPMIUM",
      url: couponURL,
      categories: "",
      source: "SHOPMIUM",
      couponId: Math.random().toString(36).substring(7),
    };
    }
  if(couponData)extractedDataArray.push(couponData);

  // Save the data as JSON (you can modify this part to save data as needed)
  var jsonData = JSON.stringify(couponData);

  // Check if all URLs have been processed
  if (extractedDataArray.length === maxWindowCount) {
    // All URLs have been processed, create a single JSON file with all data
    createJSONFile(extractedDataArray);
  }

  // After data extraction is complete, call the callback function
  //return extractedDataArray;
  popupWindow.close();
}

// Function to create a single JSON file with all data
function createJSONFile(dataArray) {
  
  // Convert the array of extracted data to a JSON string
  var jsonData = JSON.stringify(dataArray);
console.log(jsonData)
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
