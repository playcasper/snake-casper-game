var highestScore = 0;
var usersHighestScore = 0;
var deployHash = null;

const accountHash = 'account-hash-608102b6354980f2759f810b152376a1c8c2ed1a6c3c98079729126866bf7df2';

var testCase = 1;
Tests();


async function Tests(){

    // Test 1 - Retrieve the overall highest score
    if(testCase == 1)
    {
        document.getElementById("container").innerHTML = "<p style='color:blue'>TEST 1: Getting current highest score...</p>";
        getHighScore();

        if(highestScore > 0)
        {
            document.getElementById("container").innerHTML += "<p style='color:green'>PASSED</p><br>";
        }
        else
        {
            document.getElementById("container").innerHTML += "<p style='color:red'>FAILED</p><br>";
        }

        nextTest();
        return;
    }

    // Test 2 - Retrieve all highest scores for each user.
    // highest_score and highest_score_user values should match those in the list
    if(testCase == 2)
    {
        document.getElementById("container").innerHTML += "<p style='color:blue'>TEST 2: Getting ALL users scores...<br></p>";

        try {
            getAllScores();
            document.getElementById("container").innerHTML += "<p style='color:green'>PASSED</p><br>";
        } catch (error) {
            document.getElementById("container").innerHTML += "<p style='color:red'>FAILED</p><br>";
        }

              nextTest();
        return;
    }

    // Test 3 - Get the current users highscore.
    if(testCase == 3)
    {
        document.getElementById("container").innerHTML += "<p style='color:blue'>TEST 3: Get the currently signed in user's high score...<br></p>";

        if(IsCasperSignerInstalled())
        {
            try {
                await getUsersHighScore();
                document.getElementById("container").innerHTML += "<p style='color:green'>PASSED</p><br>";
            } catch (error) {
                document.getElementById("container").innerHTML += "<p style='color:red'>FAILED</p><br>";
            }

            nextTest();
            return;
        }
        else
        {
            document.getElementById("container").innerHTML += "<p style='color:red'>Casper Signer is not installed or working correctly. Tests stopped.</p><br>";
        }
    }

    // Test 4 - Setting users score to be lower than high score and checking that score is NOT saved
    if(testCase == 4)
    {
        newTestScore = parseInt(usersHighestScore) - 1;

        // Setting users score to be lower than high score and checking that score is not saved
        document.getElementById("container").innerHTML += "<p style='color:blue'>TEST 4: Check that new lower score of " + newTestScore + " is NOT saved...<br></p>";

        if(IsCasperSignerInstalled())
        {
            oldUsersHighestScore = usersHighestScore;

            // Set lower score for new user
            newTestScore = parseInt(usersHighestScore) - 1;
            SaveScore(newTestScore);
            return;
        }
        else
        {
            document.getElementById("container").innerHTML += "<p style='color:red'>Casper Signer is not installed or working correctly. Tests stopped.</p><br>";
        }
    }

    // Test 5 - Setting users score to be higher than previous score and checking that score IS saved
    if(testCase == 5)
    {
        await getUsersHighScore();

        if(usersHighestScore == oldUsersHighestScore)
        {
            document.getElementById("container").innerHTML += "<br><br><p style='color:green'>PASSED</p>";
        }
        else
        {
            document.getElementById("container").innerHTML += "<br><br><p style='color:red'>FAILED</p>";
        }

        newTestScore = parseInt(usersHighestScore) + 1;

        document.getElementById("container").innerHTML += "<p style='color:blue'>TEST 5: Check that new higher score of " + newTestScore + " IS saved...<br></p>";

        if(IsCasperSignerInstalled())
        {
            oldUsersHighestScore = usersHighestScore;

            // Set higher score for new user
            SaveScore(newTestScore);
            return;
        }
        else
        {
            document.getElementById("container").innerHTML += "<p style='color:red'>Casper Signer is not installed or working correctly. Tests stopped.</p><br>";
        }
    }

    if(testCase == 6)
    {
        await getUsersHighScore();

        if(parseInt(usersHighestScore) == parseInt(oldUsersHighestScore) + 1)
        {
            document.getElementById("container").innerHTML += "<br><br><p style='color:green'>PASSED</p>";
        }
        else
        {
            document.getElementById("container").innerHTML += "<br><br><p style='color:red'>FAILED</p>";
        }
        return;
    }
}

function nextTest()
{
    testCase = testCase + 1;

    Tests();
}


// Check if Casper Signer Chrome app is installed
function IsCasperSignerInstalled()
{
    installed = typeof window.casperlabsHelper !== "undefined";

    if(installed == false)
    {
        document.getElementById("container").innerHTML += "<br><br>Casper Signer is not installed. Please install the Casper Signer from the Chrome store";
    }

    return installed;
}

// Get the highest score from the blockchain
function getHighScore(){
    // Post a request to get the highscore
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/highscore", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        value: accountHash
    }));

    if (xhr.status === 200) {
        // Update the highest score display
        highestScore = xhr.responseText;

        document.getElementById("container").innerHTML += "Highest Score: " + highestScore + "<br>";
    }
}

// Get the highest score from the blockchain
function getAllScores(){
    // Post a request to get the highscore
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/allscores", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        value: accountHash
    }));

    if (xhr.status === 200) {
        // Update the highest score display
        document.getElementById("container").innerHTML += "<br>Getting highest scores for each user...<br>";
        document.getElementById("container").innerHTML += xhr.responseText;
    }
}

// Get the users previously submitted highest score from the blockchain
async function getUsersHighScore(){

    // Call the Casper Signer app to request a connection
    await window.casperlabsHelper.requestConnection();

    // Check that the app is connected
    const isConnected = await window.casperlabsHelper.isConnected()

    usersHighestScore = 0;

    if(isConnected){
        // Use the Casper Signer app to get the users public key
        publicHash = 0;
        try {
            publicHash = await window.casperlabsHelper.getActivePublicKey();
        } catch (error) {
            document.getElementById("container").innerHTML += "<p style='color:red'>Not logged in to Casper Signer. Please recify and restart tests.</p><br>";
            return;
        }

        // Post a request to get the highscore
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/usershighscore", false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            value: 'hash-a63b544149a3274ae7e4479e36951020d5c2db1750b3dd94219757b12aea5f42',
            name: publicHash
        }));

        if (xhr.status === 200) {
            if(xhr.responseText == "0")
            {
                document.getElementById("container").innerHTML += "<br>You don't have a previous highscore saved<br>";
            }
            else
            {
                usersHighestScore = xhr.responseText;
                document.getElementById("container").innerHTML += "<br>Your previous highest saved score is: " + xhr.responseText + "<br>";
            }
        }
    }
    else
    {
        // Capser Signer App is not connected
        alert("Press connect on your Capser Signer App.");
        window.casperlabsHelper.requestConnection();
    }
}

// Save the users score. Create the deploy, sign, make the deploy and check the deploy
async function SaveScore(score){
    // Call the Casper Signer app to request a connection
    await window.casperlabsHelper.requestConnection();

    // Check that the app is connected
    const isConnected = await window.casperlabsHelper.isConnected()

    if(isConnected){
        // Use the Casper Signer app to get the users public key
        publicKey = 0;
        try {
            publicKey = await window.casperlabsHelper.getActivePublicKey();
        } catch (error) {
            document.getElementById("container").innerHTML += "<p style='color:red'>Not logged in to Casper Signer. Please recify and restart tests.</p><br>";
            return;
        }

        // Call function to save the score
        reply = await savetHighScore(publicKey, score);

        // Check the status of the reply
        if (reply != "Failed")
        {
            // The reply is good, so use the Casper Signer app to sign the deploy
            const signedDeployJSON = await window.casperlabsHelper.sign(reply, publicKey);

            // Post a request to make the deploy
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/deploy", false);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(signedDeployJSON));

            if (xhr.status === 200) {
                if(xhr.responseText == "Error")
                {
                    // An error occurred during the deploy
                    document.getElementById("container").innerHTML += "<br>Insufficient funds in account.<br>Get some more Casper!<br><br>";
                }
                else
                {
                    // No errors occurred during the deploy
                    document.getElementById("container").innerHTML += "<br>Your score has been submitted to the Casper blockchain.<br>Waiting 60 seconds for a reply....<br>";

                    setTimeout(function(){
                        nextTest();
                    }, 60000);
                }
            }
        }
        else
        {
            // An error occurred during the deploy
            document.getElementById("container").innerHTML += "<br><br>Saving the score has failed";
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



