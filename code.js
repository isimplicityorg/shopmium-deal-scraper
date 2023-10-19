
var limit = 2; // Optionally, set a limit on the number of coupons to return (e.g., 5)
var arrCouponUrls = getCouponUrls();
var couponCountTotal = arrCouponUrls.length;
var popupWindow = null
// Create an array to store extracted data from each URL
var extractedDataArray = [];
var couponCount = 0
var outputOptionDumpAllData = false;
var outputOptionDbData = true;
//parseFirstCoupon();
console.log(arrCouponUrls)
//console.log(arrCouponUrls[couponCount++])
openPopup(arrCouponUrls[couponCount], "couponwindow");

function getNextCouponUrl() {
  console.log(arrCouponUrls)
  return arrCouponUrls[couponCount++];  //return arrCouponUrls[couponCount++]
  //couponCount++;
}
function getCouponUrls() {
  // Select all card elements with the class 'nodesListItem'
  var couponCards = document.querySelectorAll('.nodesListItem');
  // Convert the NodeList into an array and slice it to limit the number of cards
  if (limit == -1) {
    var couponArray = Array.from(couponCards);
  } else {
    var couponArray = Array.from(couponCards).slice(0, limit - 1);
  }
  // Extract the URLs from the selected cards
  var couponURLs = couponArray.map(card =>
    card.querySelector('a.node').getAttribute('href')
  );

  return couponURLs;
}

function openPopup(url, windowName) {
  if (url == null || url == "") return;
  popupWindow = window.open(url, windowName);
  console.log("new popup " + windowName)
  console.log(url)
  if (popupWindow === null || typeof popupWindow === 'undefined') {
    alert('Popup blocked by the browser. Please enable popups for this website.');
  } else {
    // Add an onload event handler directly in the popup window
    popupWindow.onload = function () {
      console.log('Popup has finished loading.');
      onPopupLoad(popupWindow);

      // You can add additional actions here when the popup finishes loading
    };
  }
}

function onPopupLoad(popupWindow) {
  //do something when a popup opens
  console.log('onPopupLoad.');
  extractDataFromPopup(popupWindow, arrCouponUrls[couponCount]);
}

async function extractDataFromPopup(popupWindow, couponURL) {
  // Extract data from the new window's document
  var rebateElement = popupWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--highlight');
  var brandNameElement = popupWindow.document.querySelector('.heading-block-title');
  var offerTitleElement = popupWindow.document.querySelector('.details-informations-title');
  var offerTermsElement = popupWindow.document.querySelector('.Offers-DetailsBlock__content p');
  var offerEndTimeElement = popupWindow.document.querySelector('.node_status__offer_details.time.offer-end');
  var headingDescriptionElement = popupWindow.document.querySelector('.heading-block-description.current');
  var buyElement = popupWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--after');
  var detailsDescriptionElement = popupWindow.document.querySelector('.details-informations-container p');

  // Check if elements exist and extract their content
  var rebateAmount = rebateElement ? cleanText(rebateElement.innerText.trim()) : "Unknown";
  var detailsDescription = detailsDescriptionElement ? cleanText(detailsDescriptionElement.textContent.trim()) : '';
  var brandName = brandNameElement ? cleanText(brandNameElement.textContent.trim()) : 'Unknown';
  var offerTitle = offerTitleElement ? cleanText(offerTitleElement.textContent.trim()) : 'Unknown';
  var offerTerms = offerTermsElement ? cleanText(offerTermsElement.textContent.trim()) : 'Unknown';
  var offerEndTime = offerEndTimeElement ? cleanText(offerEndTimeElement.textContent.trim()) : 'NO EXPIRATION';
  var headingDescription = headingDescriptionElement ? cleanText(headingDescriptionElement.textContent.trim()) : 'Unknown';
  var buyInfo = buyElement ? cleanText(buyElement.innerText.trim()) : 'Unknown';
  var restrictions = cleanText(getRestrictionsPopup(popupWindow.document));

  if (outputOptionDumpAllData == true) {
    var couponData = {
      rebateAmount,
      brandName,
      offerTitle,
      offerTerms,
      offerEndTime,
      detailsDescription,
      headingDescription,
      buyInfo,
      restrictions,
      couponURL // Include the couponURL in the data
    };
  }
  if (outputOptionDbData == true) {
    var prePrompt = "Act as my grocery store stock manager. Return the category for this product. ";
    var postPrompt = ". Only tell me the category in only 2 or 3 words. Example: Baby>Pampers";
    var modelName = "gpt-3.5-turbo";
    var categories = await askGpt(prePrompt, detailsDescription, postPrompt, modelName);
    items = [
      rebateAmount,
      brandName + " | " + detailsDescription,
      offerTitle,
      offerEndTime,
      "DIGITAL",
      "SHOPMIUM",
      couponURL,
      categories,
      "SHOPMIUM",
      createCouponId("cc-")
    ];
    couponData = createDatabaseJson(items);
  }
  if (couponData) extractedDataArray.push(couponData);

  // Save the data as JSON (you can modify this part to save data as needed)
  //var jsonData = JSON.stringify(couponData);
  // After data extraction is complete, call the callback function
  //return extractedDataArray;
  console.log(extractedDataArray)
  console.log("closed")
  closePopup();
}

function closePopup() {
  if (popupWindow && !popupWindow.closed) {
    popupWindow.close();
    onPopupUnLoad();
    //do something when a popup closes
  }
}

function onPopupUnLoad() {
  //do something when a popup closes
  //i dont think there is anything to do here
  console.log("popup closed couponCount " + couponCount)
  //if this is the last page then print the data to a file
  if (arrCouponUrls[couponCount] == null || arrCouponUrls[couponCount] == "") {
    createJSONFile(extractedDataArray);
  } else {
    openPopup(arrCouponUrls[couponCount++], "couponwindow");
  }
}

function getRestrictionsPopup(doc) {
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
  } else {
    return "";
  }
}
