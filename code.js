const couponCards = document.querySelectorAll('.nodesListItem');

// Function to scrape data from a coupon URL and save it as JSON
function scrapeAndSaveData(couponURL) {
  // Open the coupon URL in a new window/tab
  console.log(couponURL)
  const newWindow = window.open(couponURL, '_blank');
if (newWindow === null) {
  // Show the popup blocker message
  alert("Your popup blocker is preventing some features from working. Please disable it for this site.");
}
  // Wait for the new window to load
  newWindow.addEventListener('load', () => {
    // Extract data from the new window's document
    const rebateElement = newWindow.document.querySelector('.Offers-RebateLine.Offers-RebateLine--highlight');

    if (rebateElement) {
      // Extract the content of the rebate element
      const rebateAmount = rebateElement.textContent.trim();

      // Create an object to store the extracted data
      const couponData = {
        rebateAmount,
        couponURL,
      };

      // Close the new window/tab
      newWindow.close();

      // Save the data as JSON (you can modify this part to save data as needed)
      const jsonData = JSON.stringify(couponData);
      console.log(jsonData);
    } else {
      // If the rebate element is not found, handle the error or missing data as needed
      console.log('Rebate element not found on the page.');
      newWindow.close();
    }
  });
}

// Iterate over each coupon card and extract the URL
couponCards.forEach(card => {
  const couponURL = card.querySelector('a.node').getAttribute('href');
  
  // Call the function to scrape and save data for each URL
  scrapeAndSaveData(couponURL);
});
