function federatedSignUp() {
    const cognitoDomain = 'ap-south-1yd5k4yli6.auth.ap-south-1.amazoncognito.com';
    const clientId = '76e6r6k2nssrnqe5k428qcgqod';
    const redirectUri = 'https://d9rcwfrwbqgvj.cloudfront.net';
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
    const apiUrl = 'https://zlmz2kojk6.execute-api.ap-south-1.amazonaws.com/prod/SaveUser'; // Replace with your API Gateway URL

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

    // Store tokens in cookies with different expiration times
    setCookie("id_token", idToken, 30); // Expires in 30 minutes
    setCookie("access_token", accessToken, 30); // Expires in 30 minutes
    setCookie("refresh_token", refreshToken, 1440); // Expires in 1 day (1440 minutes)

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
