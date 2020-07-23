const ethers = require('ethers')
const vether = require('./vether.js')
const BigNumber = require('bignumber.js')
const fs = require('fs')

function BN2Int(BN){return(((new BigNumber(BN)).toFixed()/10**18).toFixed(2))}

const getData = async () => {

    const provider = ethers.getDefaultProvider();
    const contract = new ethers.Contract(vether.addr2(), vether.abi(), provider)
    const currentEra = 1
    const emission = 2048
    const currentDay = await contract.currentDay()
    console.log(parseInt(currentDay._hex, 16))
    let dayArray = []
    let burntArray = []
    let unclaimedArray = []
    let emissionArray = []
    let totals = 0
    let totalsArray = []
    let vetherEmitted = 0
    let vetherArray = []
    let vetherClaimed = 0
    let claimedArray = []

    for (let i = 1; i <= currentEra; i++) {
        for (let j = 0; j < currentDay; j++) {
            const burntForDay = BN2Int(await contract.mapEraDay_Units(i, j))
            // const unclaimedUnits = BN2Int(await contract.mapEraDay_UnitsRemaining(i, j))
            //const emissionForDay = BN2Int(await contract.mapEraDay_Emission(i, j))
            const unclaimedEmission = BN2Int(await contract.mapEraDay_EmissionRemaining(i, j))
            // const claimRate = (((burntForDay - unclaimedUnits) / burntForDay)*100).toFixed(2)
            totals += +burntForDay
            vetherEmitted += emission
            vetherClaimed += emission - +unclaimedEmission
            dayArray.push(j)
            burntArray.push(burntForDay)
            unclaimedArray.push(unclaimedEmission)
            emissionArray.push(emission)
            totalsArray.push(totals)
            vetherArray.push(vetherEmitted)
            claimedArray.push(vetherClaimed)
            console.log(j, burntForDay)
        }
    }

    const claimObject = {
        days: dayArray,
        burns: burntArray,
        unclaims: unclaimedArray,
        emission: emissionArray,
        totals: totalsArray,
        claims: claimedArray,
        vether: vetherArray
    }

    await fs.writeFileSync('./src/data/claimArray.json', JSON.stringify(claimObject, null,4), 'utf8')
}

const App = async () => {
    getData()
}

App()
