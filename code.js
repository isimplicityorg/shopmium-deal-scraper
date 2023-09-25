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
openPopup(arrCouponUrls[couponCount], "couponwindow" );


function cleanText(text) {
  // Remove non-printable characters and unwanted characters
  if(text == "" || text == null)return;
  text = removeNonUTF8Chars(text);
  return text.replace(/[^ -~]+/g, '');
}

function removeNonUTF8Chars(inputString) {
  console.log(inputString )
 
  // Use a regular expression to match only UTF-8 characters
  var utf8Regex = /[^\x00-\x7F]+/g;
  
  // Replace all non-UTF-8 characters with an empty string
  var cleanedString = inputString.replace(utf8Regex, '');
  
  return cleanedString;
}

function getNextCouponUrl(){
  console.log(arrCouponUrls)
    return arrCouponUrls[couponCount++];  //return arrCouponUrls[couponCount++]
  //couponCount++;
}
function getCouponUrls(){
    // Select all card elements with the class 'nodesListItem'
    var couponCards = document.querySelectorAll('.nodesListItem');
    
    // Optionally, set a limit on the number of cards to return (e.g., 5)
    var limit = 10;
    
    // Convert the NodeList into an array and slice it to limit the number of cards
    if(limit == -1){
      var couponArray = Array.from(couponCards);
    }else{
    var couponArray = Array.from(couponCards).slice(0, limit-1);
    }
    // Extract the URLs from the selected cards
    var couponURLs = couponArray.map(card =>
      card.querySelector('a.node').getAttribute('href')
    );
    
    return couponURLs;
}

function openPopup(url, windowName) {
  if(url==null || url=="")return;
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
    
  function onPopupLoad(popupWindow){
    //do something when a popup opens
    	  console.log('onPopupLoad.');
      extractDataFromPopup(popupWindow,arrCouponUrls[couponCount]);
  }
  
  function extractDataFromPopup(popupWindow, couponURL) {
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
    var brandName = brandNameElement ? cleanText(brandNameElement.textContent.trim()) : '';
    var offerTitle = offerTitleElement ? cleanText(offerTitleElement.textContent.trim()) : '';
    var offerTerms = offerTermsElement ? cleanText(offerTermsElement.textContent.trim() ): '';
    var offerEndTime = offerEndTimeElement ? cleanText(offerEndTimeElement.textContent.trim()) : 'NO EXPIRATION';
    var description = descriptionElement ? cleanText(descriptionElement.textContent.trim()) : '';
    var buyInfo = buyElement ? cleanText(buyElement.innerText.trim()) : '';
    var restrictions = cleanText(getRestrictionsPopup(popupWindow.document));
  
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
        offerName: description + " " + offerTitle ,
        offerDetails: offerTitle,
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
  
  function onPopupUnLoad(){
    //do something when a popup closes
    //i dont think there is anything to do here
   console.log("popup closed couponCount " + couponCount)
    //if this is the last page then print the data to a file
    if(arrCouponUrls[couponCount] ==  null || arrCouponUrls[couponCount] == ""){
    createJSONFile(extractedDataArray);
    }else{
      openPopup(arrCouponUrls[couponCount++],"couponwindow");
    }
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
