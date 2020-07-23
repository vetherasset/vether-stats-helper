const VETHER = require('./artifacts/Vether.json')

const addr = () => {
	return '0x4ba6ddd7b89ed838fed25d208d4f644106e34279'
}

const abi = () => {
	return VETHER.abi
}

module.exports = {
    abi, addr
}
