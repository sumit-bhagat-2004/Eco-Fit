// Updated window.onload implementation
window.onload = function() {
    handleCognitoCallback(); // Existing function to handle Cognito callback
    manageProfileSection();  // Existing function to manage profile section visibility
};
function federatedSignUp() {
    const cognitoDomain = 'ap-south-1yd5k4yli6.auth.ap-south-1.amazoncognito.com';
    const clientId = '76e6r6k2nssrnqe5k428qcgqod';
    const redirectUri = 'https://d9rcwfrwbqgvj.cloudfront.net';
    const responseType = 'code'; // Change response_type to 'code'

    const signUpUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email+profile+openid`;
    window.location.href = signUpUrl;
}
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

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = decodeURIComponent(atob(base64Url).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
}
function setCookie(name, value, minutes) {
    let expires = "";
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function refreshPage() {
    window.location.reload();
}

window.onload = function() {
    manageProfileSection();  // New function to manage profile section visibility
};

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
    } else {
        // Hide profile section and show sign in section
        signinSection.classList.remove("hidden");
        profileSection.classList.add("hidden");
    }
}

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
// Event listeners for profile modal
document.getElementById("profile-button").addEventListener("click", () => {
    document.getElementById("profile-modal").style.display = "block";
});

document.querySelector(".profile-modal-close").addEventListener("click", () => {
    document.getElementById("profile-modal").style.display = "none";
});

// Event listener for logout button
document.getElementById("logout-button").addEventListener("click", logout);