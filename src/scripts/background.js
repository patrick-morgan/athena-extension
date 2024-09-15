// background.js

// Check if chrome is defined before using it
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "STRIPE_REDIRECT") {
      handleStripeRedirect(request.status);
      sendResponse({ received: true });
    }
  });

  chrome.runtime.onStartup.addListener(function () {
    chrome.storage.local.get(["stripeRedirectStatus"], function (result) {
      if (result.stripeRedirectStatus) {
        handleStripeRedirect(result.stripeRedirectStatus);
        chrome.storage.local.remove("stripeRedirectStatus");
      }
    });
  });
}

function handleStripeRedirect(status) {
  if (status === "success") {
    // Handle successful payment
    console.log("Payment successful");
    // Update UI or state as needed
  } else if (status === "cancel") {
    // Handle cancelled payment
    console.log("Payment cancelled");
    // Update UI or state as needed
  }
}
