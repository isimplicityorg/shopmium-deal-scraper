// Assuming you have multiple coupon cards on the page, you can select them all.
var couponCards = document.querySelectorAll('.nodesListItem');
// Iterate over each coupon card and extract the URL
couponCards.forEach(card => {
  var couponURL = card.querySelector('a.node').getAttribute('href');
  
  // Call the function to scrape and save data for each URL
  scrapeAndSaveData(couponURL);
});

// Function to scrape data from a coupon URL and save it as JSON
function scrapeAndSaveData(couponURL) {
  // Open the coupon URL in a new window/tab
  var newWindow = window.open(couponURL, '_blank');
if(newWindow==null){alert("Your popup blocker is preventing some features from working. Please disable it for this site.")}
  // Wait for the new window to load
  newWindow.addEventListener('load', function () {
    // Extract data from the new window's document
    var rebateElement = newWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--highlight');
    console.log(rebateElement);

    if (rebateElement) {
      // Extract the content of the rebate element
      var rebateAmount = rebateElement.innerText.trim();
    }

    var brandNameElement = newWindow.document.querySelector('.heading-block-title');
    var offerTitleElement = newWindow.document.querySelector('.details-informations-title');
    var offerTermsElement = newWindow.document.querySelector('.Offers-DetailsBlock__content p');
    var offerEndTimeElement = newWindow.document.querySelector('.node_status__offer_details.time.offer-end');
    var descriptionElement = newWindow.document.querySelector('.heading-block-description.current');
    var buyElement = newWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--after');

    // Check if elements exist and extract their content
    var brandName = brandNameElement ? brandNameElement.textContent.trim() : '';
    var offerTitle = offerTitleElement ? offerTitleElement.textContent.trim() : '';
    var offerTerms = offerTermsElement ? offerTermsElement.textContent.trim() : '';
    var offerEndTime = offerEndTimeElement ? offerEndTimeElement.textContent.trim() : '';
    var description = descriptionElement ? descriptionElement.textContent.trim() : '';
    var buyInfo = buyElement ? buyElement.innerText.trim() : '';

    // Create an object to store the extracted data
    var couponData = {
      rebateAmount,
      brandName,
      offerTitle,
      offerTerms,
      offerEndTime,
      description,
      buyInfo,
    };

    // Save the data as JSON (you can modify this part to save data as needed)
    var jsonData = JSON.stringify(couponData);
    console.log(jsonData);

    // Close the new window/tab after scraping
    newWindow.close();
  });
}
