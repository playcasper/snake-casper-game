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

You will need the following tools installed.

You can check the Casper's [documentation here](https://docs.casperlabs.io/dapp-dev-guide/writing-contracts/getting-started/)

Here are the version of the tools that were used to build and run the smartcontract :

```
rustup --version
rustup 1.25.1 (bb60b1e89 2022-07-12)

cmake --version
cmake version 3.22.1

```

You also need [Git](https://git-scm.com/downloads) to clone the repository.

To build the smartcontract :

```
git clone https://github.com/playcasper/snake-casper-game.git
cd highscore-casper
make prepare
make build-contract
```

The highscore.wasm file will be created in the folder:

```
/highscore-casper/target/wasm32-unknown-unknown/release
```

You can deploy the wasm file to your own test block-chain or use the one that has already been deployed to the testnet.cspr.live platform.

## How to run the tests

Follow the section above and then :

```
cd highscore-casper
make test
```
The output should be something like this :

```
make test
cd contract && cargo build --release --target wasm32-unknown-unknown
    Finished release [optimized] target(s) in 0.08s
wasm-strip contract/target/wasm32-unknown-unknown/release/highscore.wasm 2>/dev/null | true
mkdir -p tests/wasm
cp contract/target/wasm32-unknown-unknown/release/highscore.wasm tests/wasm
cd tests && cargo test
    Finished test [unoptimized + debuginfo] target(s) in 0.16s
     Running unittests src/integration_tests.rs (target/debug/deps/integration_tests-3b1acdb88faa4e36)

running 7 tests
test tests::check_initial_conditions ... ok
test tests::get_high_score_for_none_user - should panic ... ok
test tests::set_high_score_for_new_user ... ok
test tests::get_high_score_for_valid_user ... ok
test tests::set_score_for_new_user_higher_than_other_user_highscore ... ok
test tests::set_score_for_same_user_higher_than_highscore ... ok
test tests::set_score_for_same_user_lower_than_highscore ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 2.15s
```

## Running the game locally

NodeJS and Express need to be installed to run on your Linux system:

```
cd snake-casper-game-main
sudo apt install nodejs
sudo apt install npm
npm install express
```

Using NodeJS start the game:

```
node app.js
```

Then open Google Chrome and visit the URL:

```
http://localhost:9000
```

Google Chrome is necessary because Casper Signer only works with Google Chrome.

This code points to a peer on the testnet.cspr.live where the highscore contract has been deployed. To work on a local block chain the code can be modified to point to the local address.
