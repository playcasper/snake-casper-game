const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 9000;

const bodyParser = require('body-parser');
app.use(cors());

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

const {CasperServiceByJsonRPC, DeployUtil, decodeBase16, CLPublicKey, RuntimeArgs, CLI32, CLString } = require("casper-js-sdk");
const casperService = new CasperServiceByJsonRPC("http://195.201.174.222:7777/rpc");

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/snake.html'));
});

// Get the highscore from the block chain
app.post('/highscore', async (req, res) => {
    var hash = req.body.value;
    var highscore = "0";

    // Get the state root hash
    const latestBlock = await casperService.getLatestBlockInfo();
    const stateRootHash = await casperService.getStateRootHash(latestBlock.block.hash);

    // Get the highscore from the contract
    const result = await casperService.getBlockState(
        stateRootHash,
        hash,
        ['highscore']
    );

    // Parse the json response to get the highscore
    var obj = JSON.parse(JSON.stringify(result));

    for (let i = 0; i < obj.Contract.namedKeys.length; i++) {
        if(obj.Contract.namedKeys[i].name == "highest_score") {
            const scoresData = await casperService.getBlockState(
                stateRootHash,
                hash,
                ['highscore',obj.Contract.namedKeys[i].name]
            );
                
            highscore = JSON.parse(JSON.stringify(scoresData)).CLValue;
        }
    } 

    // Return the highscore
    res.status(200).send(highscore);
});

// Get the users highscore from the block chain
app.post('/usershighscore', async (req, res) => {
    var hash = req.body.value;
    var name = req.body.name;

    console.log("Name ",name)
  
    var highscore = "0";
  
    try{
        // Get the state root hash
        const latestBlock = await casperService.getLatestBlockInfo();
        const stateRootHash = await casperService.getStateRootHash(latestBlock.block.hash);
    
        // Get the users highscore from the contract
        const result = await casperService.getBlockState(
            stateRootHash,
            hash,
            [name]
        );
    
        // Parse the json response to get the highscore
        var obj = JSON.parse(JSON.stringify(result));
    
        highscore = JSON.parse(JSON.stringify(obj)).CLValue;
    } catch (error){
    }
    
    // Return the highscore
    res.status(200).send(highscore);
});

// Set up the deploy for signing
app.post("/savehighscore", async (req, res) => {
    let publicKey  = req.body.value1;
    let score  = req.body.value2;

    // Set up the deploy params 
    const deployParams = new DeployUtil.DeployParams(CLPublicKey.fromHex(publicKey), "casper-test");
  
    // Set up the arguments for the contract call
    const args = RuntimeArgs.fromMap({
        name: new CLString(publicKey),
        value: new CLI32(score)
    });
     
    // Get the contract hash
    const contractHash = decodeBase16("05bb1bf3856b1854437a5dc5d30d223b556cfb0f387d0c0247e235cad66f4c1f");

    // Configure the deploy with entry point and payment
    const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        contractHash,
        "highscore_set",
        args
    );
      
    let payment = DeployUtil.standardPayment(1000000000);
     
    const deploy = DeployUtil.makeDeploy(
        deployParams,
        session,
        payment
    );
    
    const deployJSON = DeployUtil.deployToJson(deploy);

    // Return the deploy for signing
    res.status(200).send(deployJSON);
});

// Make the deploy to the block chain
app.post("/deploy", async (req, res) => {
    
    let deployHash = "Error";
    
    try {
        // Make the deploy
        const signedDeploy = DeployUtil.deployFromJson(req.body).unwrap();
        const deployResult = await casperService.deploy(signedDeploy);
        
        // Get the deploy hash
        deployHash = JSON.parse(JSON.stringify(deployResult)).deploy_hash;
    } catch (error) {
    }
    
    res.status(200).send(deployHash);
});

// Check the status of the deploy status
app.post("/getdeloystatus", async (req, res) => {
    
    let returnMessage = null;
    
    try {
        deployHash = req.body.value;

        const deployInfo = await casperService.getDeployInfo(deployHash);
        returnMessage = deployInfo;
    } catch(error) {
        returnMessage = error.message;
    } 
    
    // Return deploy status
    res.status(200).send(returnMessage);
});

// Start the app listening
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});