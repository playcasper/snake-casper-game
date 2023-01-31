var highestScore = 0;
var usersHighestScore = 0;
var deployHash = null;
var retryCount = 24;

// Start by retrieving the highest score 
getHighScore();

// Event for saving the highscore
const btnSaveScore = document.getElementById("saveScore");
btnSaveScore.addEventListener("click", async () => {
    // Retrieve the users high score after playing the game
    usersHighestScore = document.getElementById('score').innerHTML;

    // If the users highscore is greater than the previous record then update the display    
    if(usersHighestScore > highestScore)
    {
        document.getElementById("high_score").innerHTML = "Highest Score: " + usersHighestScore;
    }
    
    await SaveScore();
});

// Event for signing in to the Casper Signer
const btnSignIn = document.getElementById("signIn");
btnSignIn.addEventListener("click", async () => {
    // Check if Casper Signer Chrome app is installed
    if(!IsCasperSignerInstalled()){
        alert("Please install the Casper Signer from the Chrome store");
    }
});

// Check if Casper Signer Chrome app is installed
function IsCasperSignerInstalled()
{
    return typeof window.casperlabsHelper !== "undefined";
}

// Get the highest score from the blockchain
function getHighScore(){
    // Post a request to get the highscore
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/highscore", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onload = function() {
        // Update the highest score display
        highestScore = this.responseText;
        document.getElementById("high_score").innerHTML = "Highest Score: " + highestScore;
    }     
}

// Get the users previously submitted highest score from the blockchain
function getUsersHighScore(hash){
    // Post a request to get the highscore
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/usershighscore", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        name: hash
    }));
    xhr.onload = function() {
        if(this.responseText == "0")
        {
            document.getElementById("users_high_score").innerHTML = "You don't have a previous highscore saved<br><br>";
        }
        else
        {
            document.getElementById("users_high_score").innerHTML = "In the meantime..<br>Your previous highest saved score is: " + this.responseText + "<br><br>";
        }
    }     
}

// Save the users score. Create the deploy, sign, make the deploy and check the deploy
async function SaveScore(){
    // Call the Casper Signer app to request a connection
    await window.casperlabsHelper.requestConnection();
    
    // Check that the app is connected
    const isConnected = await window.casperlabsHelper.isConnected()

    retryCount = 24;

    if(isConnected){
        // Use the Casper Signer app to get the users public key
        const publicKey = await window.casperlabsHelper.getActivePublicKey();
        
        // Call function to save the score
        reply = await savetHighScore(publicKey, usersHighestScore);
    
        // Check the status of the reply
        if (reply != "Failed")
        {
            // The reply is good, so use the Casper Signer app to sign the deploy
            const signedDeployJSON = await window.casperlabsHelper.sign(reply, publicKey);
            
            // Post a request to make the deploy
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/deploy", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(signedDeployJSON));
            xhr.onload = function() {
                if(this.responseText == "Error")
                {
                    // An error occurred during the deploy
                    document.getElementById("submission_response").innerHTML = "Insufficient funds in account.<br>Get some more Casper!<br><br>";
                }
                else
                {
                    // No errors occurred during the deploy
                    document.getElementById("submission_response").innerHTML = "Your score has been submitted to the Casper blockchain.<br>Please wait for a reply....<br>(This can take a minute!)<br><br>";
                    
                    getUsersHighScore(publicKey);

                    // Get the deploy hash and check for the deploy status
                    deployHash = this.responseText;
                    checkDeployStatus();
                }
            }
        }
        else
        {
            // An error occurred during the deploy
            document.getElementById("submission_response").innerHTML = "Saving the score has failed<br><br>";
        }
    }
    else
    {   
        // Capser Signer App is not connected
        alert("Press connect on your Capser Signer App.");
        window.casperlabsHelper.requestConnection();
    }
}

// Function to make the request to create the deploy for signing
async function savetHighScore(publicKey, score){
    // Post a request to create the deploy
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/savehighscore", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        value1: publicKey,
        value2: score
    }));
    
    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    }
    
    return "Failed";
}


// Check the deploy status on a 5 second timer
function checkDeployStatus() {
    getDeployResultInterval = setInterval(() => {
        getDeployResult();
    }, 5000);
}

// Check the deploy status
async function getDeployResult() {
    try {
        // Post a request to get the deploy status
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/getdeloystatus", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            value: deployHash
        }));        
        xhr.onload = function() {
            // Parse the response
            deployInfo = this.responseText;
            // Check the execution results
            if (JSON.parse(deployInfo).execution_results.length == 1) {
                // Execution results are present so stop the timer and check the result
                clearInterval(getDeployResultInterval);
                if (JSON.parse(deployInfo).execution_results[0].result.hasOwnProperty("Success")) {
                    document.getElementById("submission_response").innerHTML = "Your score has been successfully saved on the Casper blockchain!<br><br>";
                } else {
                    document.getElementById("submission_response").innerHTML = "There was an error: " + JSON.stringify(JSON.parse(deployInfo).execution_results[0].result.Failure.error_message);
                }        
            }
        }
    } catch(error) {
        alert('getDeployResult: ' + error.message);
    }
    
    if (retryCount <= 0)
    {
        alert("Deploy checking timed out");
        clearInterval(getDeployResultInterval);
    }
        
    retryCount = retryCount - 1;
}
