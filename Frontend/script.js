document.addEventListener('DOMContentLoaded', (event) => {
    if (document.cookie.includes('cookieAccepted')) {
      // Register service worker if cookies are accepted
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          }).catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      }
  
      // Initialize other JavaScript functions
      initializeYourFunctions();
    }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const hamburger = document.getElementById('hamburger');
        const navlist = document.getElementById('navlist');
      
        hamburger.addEventListener('click', function() {
          if (navlist.classList.contains('active')) {
            navlist.classList.remove('active');
          } else {
            navlist.classList.add('active');
          }
        });
      });

  document.getElementById('share-button').addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Benavodayan',
          text: 'Check out this awesome educational app!',
          url: window.location.href
        });
        console.log('App shared successfully');
      } catch (error) {
        console.error('Error sharing app:', error);
      }
    } else {
      alert('Web Share API not supported in this browser.');
    }
  });

document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("modal");
    var modalImg = document.getElementById("modal-img");
    var captionText = document.getElementById("caption");
    var closeBtn = document.getElementsByClassName("close")[0];

    var galleryItems = document.getElementsByClassName("gallery-item");

    Array.from(galleryItems).forEach(function(item) {
        item.addEventListener("click", function() {
            modal.style.display = "block";
            modalImg.src = this.getElementsByTagName("img")[0].src;
            captionText.innerHTML = this.getElementsByTagName("img")[0].alt;
        });
    });

    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});

function federatedSignUp() {
    const cognitoDomain = 'benavodayan.auth.ap-south-1.amazoncognito.com';
    const clientId = '3rtrk6e03558u1osmo6pgi95ce';
    const redirectUri = 'https://www.benavodayan.in/index.html';
    const responseType = 'code'; // Change response_type to 'code'

    const signUpUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email+profile+openid`;
    window.location.href = signUpUrl;
}

// Function to handle OAuth callback
let handledCallback = false;

function handleCognitoCallback() {
    if (handledCallback) {
        return; // Exit if callback has already been handled
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        exchangeCodeForTokens(code);
        handledCallback = true; // Mark callback as handled
    }
}

// Function to exchange code for tokens and save user
async function exchangeCodeForTokens(code) {
    const apiUrl = 'https://43tqjz6wzi.execute-api.ap-south-1.amazonaws.com/prod/Users'; // Replace with your API Gateway URL

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange authorization code for tokens');
        }

        const tokens = await response.json();
        storeTokensInCookies(tokens); // Call function to store tokens in cookies
    } catch (error) {
        console.error('Token exchange error:', error.message);
        // Handle error scenario (e.g., show error message to user)
    }
}
/*window.onload = function() {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    if (currentUrl === 'https://www.benavodayan.in/subscribe.html') {
        console.log('Triggering showProcessingModal');
        showProcessingModal();
    } else if (currentUrl === 'https://www.benavodayan.in/index.html') {
        console.log('Triggering handleCognitoCallback');
        handleCognitoCallback();
    } else {
        console.log('No matching URL found');
    }
}*/
window.addEventListener('load', handleCognitoCallback);


// Function to set a cookie with a specified name, value, and expiration time in minutes
function setCookie(name, value, minutes) {
    let expires = "";
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get the value of a cookie by its name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to delete a cookie by its name
function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

// Function to parse a JWT token and return the payload as an object
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
}

// Function to store user information (email, name, given name, family name, username) from an ID token into cookies
function storeUserInfoFromIdToken(idToken) {
    const decodedToken = parseJwt(idToken);

    const email = decodedToken.email;
    const name = decodedToken.name;
    const givenName = decodedToken.given_name;
    const familyName = decodedToken.family_name;
    const username = decodedToken.sub;

    // Store user information in cookies with a 30-minute expiration time
    setCookie("email", email, 30);
    setCookie("name", name, 30);
    setCookie("given_name", givenName, 30);
    setCookie("family_name", familyName, 30);
    setCookie("username", username, 30);

    console.log("User information stored in cookies successfully.");
    refreshPage();           // Refresh the page by default
}

// Function to store tokens (ID token, access token, refresh token) in cookies with appropriate expiration times

function storeTokensInCookies(tokens) {
    const idToken = tokens.id_token;
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const subscription = tokens.subscription;
    const phone = tokens.phone;

    // Store tokens in cookies with different expiration times
    setCookie("id_token", idToken, 30); // Expires in 30 minutes
    setCookie("access_token", accessToken, 30); // Expires in 30 minutes
    setCookie("refresh_token", refreshToken, 1440); // Expires in 1 day (1440 minutes)
    setCookie("subscription", subscription, 30);
    setCookie("phone", phone, 30);

    console.log("Tokens stored in cookies successfully.");
    
    // Store user info from ID token
    storeUserInfoFromIdToken(idToken);
}

// Function to refresh tokens using a refresh token
async function refreshTokens(refreshToken, clientId, tokenEndpoint) {
    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            refresh_token: refreshToken
        })
    });

    if (!response.ok) {
        throw new Error('Failed to refresh tokens');
    }

    const newTokens = await response.json();
    storeTokensInCookies(newTokens);
}

// Function to get the ID token from cookies
function getIdToken() {
    return getCookie('id_token');
}

// Function to clear all tokens and user information from cookies
function clearTokens() {
    deleteCookie('id_token');
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    deleteCookie('email');
    deleteCookie('name');
    deleteCookie('given_name');
    deleteCookie('family_name');
    deleteCookie('username');
    
    console.log("All tokens and user information cleared from cookies.");
}

// Function to refresh tokens automatically if the user is active, at intervals less than 29 minutes
function refreshTokensIfActive(refreshToken, clientId, tokenEndpoint) {
    let lastActivityTime = Date.now();

    function resetLastActivityTime() {
        lastActivityTime = Date.now();
    }

    // Update last activity time on page load, mouse movement, and key press
    window.onload = resetLastActivityTime;
    document.onmousemove = resetLastActivityTime;
    document.onkeypress = resetLastActivityTime;

    // Refresh tokens if user is active at intervals less than 29 minutes
    setInterval(() => {
        if (Date.now() - lastActivityTime < 29 * 60 * 1000) {
            refreshTokens(refreshToken, clientId, tokenEndpoint).catch(error => {
                console.error(error);
            });
        }
    }, 29 * 60 * 1000);
}

 // Function to show or hide profile section based on idToken
function manageProfileSection() {
    const idToken = getCookie("id_token");
    const profileSection = document.getElementById("profile-section");
    const signinSection = document.getElementById("signin-section");

    if (idToken) {
        // Hide sign in section and show profile section
        signinSection.classList.add("hidden");
        profileSection.classList.remove("hidden");

        // Set profile information
        document.getElementById("profile-name").textContent = getCookie("name");
        document.getElementById("profile-username").textContent = getCookie("username");
        document.getElementById("profile-email").textContent = getCookie("email");
        document.getElementById("profile-subscription").textContent = getCookie("subscription");
        document.getElementById("profile-phone").textContent = getCookie("phone");
    } else {
        // Hide profile section and show sign in section
        signinSection.classList.remove("hidden");
        profileSection.classList.add("hidden");
    }
}

// Logout function
function logout() {
    // Get ID token from cookies
    const idToken = getCookie('id_token');
    if (!idToken) {
        console.error('ID token not found.');
        return;
    }

    // Define client ID and logout redirect URI
    const clientId = '3rtrk6e03558u1osmo6pgi95ce';
    const logoutUri = encodeURIComponent('https://www.benavodayan.in/index.html');
    const cognitoLogoutUrl = `https://benavodayan.auth.ap-south-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${logoutUri}&id_token_hint=${idToken}`;

    // Attempt to redirect to Cognito logout endpoint
    try {
        window.location.href = cognitoLogoutUrl;
    } catch (error) {
        console.error('Error during logout redirection:', error);
    }
    // Optionally delete local cookies after redirect
    deleteCookies();
}

// Function to delete cookies
function deleteCookies() {
    const cookies = ["id_token", "access_token", "refresh_token", "username", "name", "given_name", "family_name", "email","subscription","phone"];
    cookies.forEach(cookie => deleteCookie(cookie));
}


// Event listeners for profile modal
document.getElementById("profile-button").addEventListener("click", () => {
    document.getElementById("profile-modal").style.display = "block";
});

document.querySelector(".profile-modal-close").addEventListener("click", () => {
    document.getElementById("profile-modal").style.display = "none";
});

// Event listener for logout button
document.getElementById("logout-button").addEventListener("click", logout);

// Function to check cookies in console
function logCookies() {
    let cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        let [name, value] = cookie.split('=');
        console.log(`Name: ${name.trim()}, Value: ${decodeURIComponent(value.trim())}`);
    });
}

// Call the function to log cookies to the console
logCookies();

// On page load, manage profile section visibility
window.onload = function() {
    manageProfileSection();  // New function to manage profile section visibility
};

// Function to refresh the page by default
function refreshPage() {
    window.location.reload();
}

// Function to show profile modal
function showProfileModal() {
    const modal = document.getElementById("profile-modal");
    modal.style.display = "block";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
}

// Function to hide profile modal
function hideProfileModal() {
    const modal = document.getElementById("profile-modal");
    modal.style.display = "none";
}

// Event listener for profile button to show modal
document.getElementById("profile-button").addEventListener("click", showProfileModal);

// Event listener for modal close button to hide modal
document.querySelector(".profile-modal-close").addEventListener("click", hideProfileModal);

// Updated window.onload implementation
window.onload = function() {
    handleCognitoCallback(); // Existing function to handle Cognito callback
    manageProfileSection();  // Existing function to manage profile section visibility
};

// Function to accept cookies
function acceptCookies() {
    document.getElementById('cookieConsent').style.display = 'none';
    setCookie('cookiesAccepted', 'true', 525600); // 525600 minutes = 1 year
}

// Check if cookies have been accepted
document.addEventListener("DOMContentLoaded", function() {
    if (!getCookie('cookiesAccepted')) {
        document.getElementById('cookieConsent').style.display = 'block';
    } else {
        document.getElementById('cookieConsent').style.display = 'none';
    }
});
// Function to show processing modal after redirection
function showProcessingModal() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const success = urlParams.get('success');
    const amount = urlParams.get('amount');
    const transactionId = urlParams.get('transactionId');

    if (code) {
        const processingModal = document.getElementById("paymentProcessingModal");
        const modalContent = processingModal.querySelector('.modal-content');
        const loader = modalContent.querySelector('.loader');
        const heading = modalContent.querySelector('h2');
        const contactInfo = modalContent.querySelectorAll('p');

        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText === '.modal-content') {
                        rules[j].style.justifyContent = 'center';
                        rules[j].style.alignItems = 'center';
                        rules[j].style.maxWidth = '500px';
                        rules[j].style.maxHeight = '500px';
                    }
                }
            } catch (e) {
                console.warn(`Could not access stylesheet: ${styleSheets[i].href}`, e);
            }
        }

        if (code === 'PAYMENT_SUCCESS' && success === 'True') {
            loader.className = 'green-tick';
            heading.innerText = "Payment Successful";
            contactInfo[0].innerText = `Amount: ${amount}`;
            contactInfo[1].innerText = `Transaction ID: ${transactionId}`;
            contactInfo[2].innerText = "Please note the transaction ID for further use.";
            contactInfo[3].style.display = 'none';
            contactInfo[4].style.display = 'none';
            /*contactInfo[5].style.display = 'none';*/
        } else {
            loader.className = 'red-cross';
            heading.innerText = "Payment Unsuccessful";
            contactInfo[0].innerHTML = `Code: <b>${code}</b>`;
            contactInfo[1].innerText = "Please contact :";
            contactInfo[2].innerText = 'Owner: Sumit Bhagat';
            contactInfo[3].style.display = 'Phone: 629172541';
            contactInfo[4].style.display = 'email: infobenavodayan@gmail.com';
            /*contactInfo[5].style.display = 'none';*/
        }

        // Add countdown timer and clickable link
        const countdownElement = document.createElement('p');
        countdownElement.id = 'countdown';
        modalContent.appendChild(countdownElement);

        const redirectLink = document.createElement('a');
        redirectLink.href = '#';
        redirectLink.innerText = 'Click here if not redirected';
        redirectLink.onclick = function() {
            redirectToSignIn();
            return false;
        };
        modalContent.appendChild(redirectLink);

        processingModal.style.display = "block";

        // Start the countdown timer
        startCountdown(15);
    }
}

// Function to start the countdown timer
function startCountdown(seconds) {
    const countdownElement = document.getElementById('countdown');
    let remainingTime = seconds;

    const interval = setInterval(() => {
        countdownElement.innerText = `Redirecting in ${remainingTime} seconds...`;
        remainingTime--;

        if (remainingTime < 0) {
            clearInterval(interval);
            redirectToSignIn();
        }
    }, 1000);
}

// Function to redirect to signin.html and trigger logout
function redirectToSignIn() {
    logout();
    window.location.href = 'signin.html';
}
window.addEventListener('load', showProcessingModal);

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini info bar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  document.getElementById('installBtn').style.display = 'block';

  document.getElementById('installBtn').addEventListener('click', () => {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null; // Clear the deferred prompt
      document.getElementById('installBtn').style.display = 'none'; // Hide button again
    });
  });
});