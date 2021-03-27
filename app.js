require('dotenv').config()

const fs = require('fs')
const express = require("express")
const cors = require('cors')

const server = express()
const port = process.env.PORT ? process.env.PORT : 3000

const ethers = require('ethers')
const vether = require('./vether.js')
const BigNumber = require('bignumber.js')

const BN2Int = (BN) => {
    return(((new BigNumber(parseInt(BN._hex, 16))).toFixed()/10**18).toFixed(2))
}

const getData = async () => {

    const provider = ethers.getDefaultProvider()
    const contract = new ethers.Contract(vether.addr(), vether.abi(), provider)
    const currentEra = await contract.currentEra()
    const emission = 1024
    const currentDay = await contract.currentDay()
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

    console.log(`Now checking for changes.`)
    let i
    for (i = 1; i <= currentEra; i++) {
        let d = i < currentEra ? 244 : currentDay
        for (j = 0; j <= d; j++) {
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

    console.log(`Writing into json.`)
    await fs.writeFileSync('./claimArray.json', JSON.stringify(claimObject, null,4), 'utf8')

    console.log(`Waiting...`)
}

const App = async () => {

    server.listen(port, () => console.log(`I'm ready on port ${port}.`));

    server.get('/', cors(), (req, res) => {
        res.sendFile('claimArray.json', { root: __dirname })
    })

    getData()

    setInterval(() =>
        getData(),
        process.env.TIMETOWAIT
    )

}

App()
