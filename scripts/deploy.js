
const hre = require('hardhat');
const ethers = hre.ethers;

// ------------------------
// DEPLOYMENT VARIABLES
// ------------------------

const feeReceiverAddress =  '0xaaaa5305081447839316859e8104033faD62C05b';   // Address who should receive fee from exchanges
const initialFeeAmount =    '500';                                          // 5% from all exchanges
const uniswapFactory =      '0xc35DADB65012eC5796536bD9864eD8773aBc74C4';   // Same address for all networks
const wethAddress =         '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323';   // Rinkeby WETH address
const daiAddress =          '0xc5371a88356FCC77F9959b928Db83aA432D7e837';   // Rinkeby DAI address

async function main() {
    if (!feeReceiverAddress) {
        throw 'Fee receiver values are missing. Please fill and re-run the script!'
    }

    const Exchange = await ethers.getContractFactory('Exchange');
    const UniswapOracle = await ethers.getContractFactory('UniswapOracle');
    const MockStablecoin = await ethers.getContractFactory('MockStablecoin');


    pusdContract = await MockStablecoin.deploy('pUSD Stablecoin', 'PUSD');
    await pusdContract.deployed();
    console.log('1) PUSD contract address:', pusdContract.address);

    priviContract = await MockStablecoin.deploy('PRIVI Token', 'PRIVI');
    await priviContract.deployed();
    console.log('2) PRIVI contract address:', priviContract.address);

    uniswapOracle = await UniswapOracle.deploy(uniswapFactory, wethAddress, daiAddress);
    await uniswapOracle.deployed();
    console.log('3) Uniswap oracle contract:', uniswapOracle.address);

    exchange = await Exchange.deploy(pusdContract.address, priviContract.address, daiAddress, wethAddress, feeReceiverAddress, initialFeeAmount, uniswapOracle.address);
    await exchange.deployed();
    console.log('4) Exchange contract:', exchange.address);

    minterRoleHash = await pusdContract.MINTER_ROLE();
    await pusdContract.grantRole(minterRoleHash, exchange.address);
    await priviContract.grantRole(minterRoleHash, exchange.address);
    console.log("5) Contract granted as a minter!");
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
