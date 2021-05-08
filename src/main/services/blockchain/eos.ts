import fetch from 'node-fetch'
import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fs from 'fs-extra'
import path from 'path'
import * as sys from '../../system'
import * as app from '../../../app.json'
import * as pkg from '../../../../package.json'

const CARMEL_CONFIG: any = pkg.carmel
const EOS_CONFIG: any = Object.assign({}, app.eos, (app.eos as any)[CARMEL_CONFIG.env])

export const NET_URL = EOS_CONFIG.endpoint as string
export const CARMEL_SYSTEM = EOS_CONFIG.carmelSystemAccount as string
export const CARMEL_TOKENS = EOS_CONFIG.carmelTokensAccount as string
export const EOS_TOKENS = EOS_CONFIG.eosTokensAccount as string

export const balances = async (data: any) => {
    const rpc = new JsonRpc(NET_URL, { fetch })

    const carmel = await rpc.get_currency_balance(CARMEL_TOKENS, data.account)
    const eos = await rpc.get_currency_balance(EOS_TOKENS, data.account)

    return {
        eos: eos[0] ? parseFloat(eos[0].split()[0]) : 0,
        carmel: carmel[0] ? parseFloat(carmel[0].split()[0]) : 0
    }
}

export const checkKey = async (data: any) => {
    const signatureProvider = new JsSignatureProvider([data.privateKey])
    const getAvailableKeys = await signatureProvider.getAvailableKeys()
    const publicKey = getAvailableKeys[0]

    const rpc = new JsonRpc(NET_URL, { fetch })
    let result = await rpc.history_get_key_accounts(publicKey)

    if (!result || !result.account_names) {
        throw new Error('Invalid private key')
    }

    const { account_names } = result

    try {
        const le2 = await rpc.get_currency_balance(EOS_TOKENS, "chunkymonkey")
        const le = await rpc.get_currency_balance(CARMEL_TOKENS, "chunkymonkey")
    } catch (e) {
        console.log(e)
    }

    const balances: any = await Promise.all(account_names.map((a: string) => (
        rpc.get_currency_balance(CARMEL_TOKENS, a)
    )))

    const accounts = account_names.map((id: string, i: number) => {
        const balance = balances[i][0] ? parseFloat(balances[i][0].split()[0]) : 0
        return { id, balance }
    })

    return {
        publicKey,
        accounts
    }
}

export const credentials = (environment?: any) => {
    let env = environment 

    if (!env) {
        sys.reload()
        env = sys.env() 
    }

    if (env.lock.exists) {
        throw new Error('The vault is locked')
    }

    try {
        const file = path.resolve(env.home.path, 'secrets', '.data', 'index.json')
        const secrets: any = JSON.parse(fs.readFileSync(file, 'utf8'))
        return secrets
    } catch {
        throw new Error('The credentials could not be loaded')
    }
}

export const read = async (contract: string, scope: string, table: string, index?: any) => {
    const rpc = new JsonRpc(NET_URL, { fetch })
    
    return await rpc.get_table_rows(Object.assign({}, {
        json: true,              
        code: contract,     
        scope,
        table,       
        limit: 100,
        reverse: false, 
        show_payer: false
    }, index && {
        key_type: index[0],
        index_position: index[1],
        upper_bound: index[2],
        lower_bound: index.length > 3 ? index[3] : index[2]
    }))
}

export const action = (contract: string, name: string, data: any) => {
    const { account } = data
    
    return {
        account: contract,
        name,
        authorization: [{
          actor: account,
          permission: 'active',
        }],
        data
    }
}

export const transaction = async (contract: string, name: string, data: any, privateKey?: string) => {   
    let key = privateKey

    if (!key) {
        const { _auth } = credentials()

        if (!_auth) {
            throw new Error('User credentials missing')
        }

        key = _auth.privateKey
    }

    const actions = [action(contract, name, data)]

    const rpc = new JsonRpc(NET_URL, { fetch })
    const signatureProvider = new JsSignatureProvider([key])
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

    try {
        const result = await api.transact({ actions }, {
            blocksBehind: 3,
            expireSeconds: 30,
        })
        
        if (!result.transaction_id || !result.processed || 
            !result.processed.receipt || !result.processed.receipt.status || 
            result.processed.receipt.status !== 'executed') {
                throw new Error('Call did not succeed')
        }
    } catch (e) {
        console.log(e)
    }
}

export const system = ({
    call: async (name: string, data: any, privateKey?: string) => transaction(CARMEL_SYSTEM, name, data, privateKey)
})

export const tokens = ({
    call: async (name: string, data: any, privateKey?: string) => transaction(CARMEL_TOKENS, name, data, privateKey)
})
