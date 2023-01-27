# Snake Game

This games was written as a demonstration on how to access the Casper block chain from a live website. The code is hosted on a GoDaddy server using NodeJS and uses a proxy server to avoid the problem of CORS (Cross-origin resource sharing). The website demonstrates how the high score of a game can be stored and retrieved on the block chain. This is achieved by using the Google Chrome extension called Casper Signer. The website playcasper.io has been whitelisted by the Casper Signer extension to connect with the block-chain.

# Usage on live website

## Generate account on testnet

1. Generate a test account on the Casper test website at the address below using Google Chrome:

https://testnet.cspr.live

2. Fund your test account by going to:

https://testnet.cspr.live/tools/faucet

3. Download and enable the Casper Signer Chrome extension from the Chrome store.

## Run the game

Visit the game website here:

https://snake.playcasper.io/

Play the game. The current highest score is pulled from the Casper Block Chain and is displayed at the top.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_1-1.jpg" width=80% height=80%>

When the game is over you will be asked to save your score on the Casper Block Chain.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_2.jpg" width=80% height=80%>

If you haven't installed the Casper Signer Extension then you will asked to do so.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_3.jpg" width=80% height=80%>

The Casper Signer extension will popup. Ensure you are logged in and the extension is connected to the website. You will see your score under the Value field. Sign your deployment by clicking on the "Sign" button.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_4.jpg" width=80% height=80%>

It can take up to a minute for the score to be saved and a notification will be given. While your score is being saved, your previous highest score will be retrieved from the Block Chain.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_5.jpg" width=80% height=80%>

If the deployment was successful then you will be notified.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_6.jpg" width=80% height=80%>

## Verification

You can verify that the deploy to save the score was complete by visiting the testnet site. You will be able to see all the deploy on this page:

https://testnet.cspr.live/deploys

Select the latest one that corresponds to highscore_set and you will see the status of the deploy.

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_9.jpg" width=80% height=80%>

# Usage in test environment

## Compiling the contract

Download the code to your linux environment. The Rust code can be found in the highscore-casper folder. Compile the contract using Cargo.

```
cd highscore-casper
cargo build --release --target wasm32-unknown-unknown
```

The highscore.wasm file will be created in the folder:

```
/highscore-casper/target/wasm32-unknown-unknown/release
```

You can deploy the wasm file to your own test block-chain or use the one that has already been deployed to the testnet.cspr.live platform.

## Running the game

Make sure that Express is installed on your system:

```
cd snake-casper-game-main
npm install express
```

Using NodeJS start the game:

```
node app.js
```

Then open Google Chrome and visit the URL

```
http://localhost:9000
```

This code points to a peer on the testnet.cspr.live where the highscore contract has been deployed. To work on a local block chain the code can be modified to point to the local address.

## Unit tests

Unit tests are included with the casper contract code. These perform the following

1) Retrieve the current highest score.

2) Retrieve all the users highest scores. This includes the overall highest score and the user who holds the highest score.

3) Retrieve the highest score for the user who is currently signed in.

4) Test that saving a lower score does NOT get saved as the users high score

5) Test that saving a higher score DOES get saved as the users high score

The tests can be run at this link on the live site:

https://snake.playcasper.io/test

Or here locally:

```
http://localhost:9000/test
```

<img src="https://playcasper.io/wp-content/uploads/2023/01/Snake_8.jpg" width=80% height=80%>
