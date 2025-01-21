
const NodeCache = require('node-cache');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// BSCSCAN API Key (ENV)
const apiKey = process.env.BSCSCAN_API_KEY;

// Contract address of AWARE token (ENV)
const cgptContractAddress = process.env.CGPT_CONTRACT_ADDRESS;

// Maximum Supply of AWARE token (ENV)
const MaxSupply = process.env.CGPT_MAX_SUPPLY;

const cache = new NodeCache({ stdTTL: 600 }); // Set the cache expiration time to 600 seconds (10 minutes)

// List of contract addresses with additional information
const contractAddresses = 
[
  {
    address: '0x30148Ff5C52D706eca2daFE6103A0e8Cfc00A6f1',
    chain: 'BNB Chain',
    type: '[Public] ChainGPT Pad IDO Sale',
    wallet: 'ChainGPT Pad - CGPT',
  },
  {
    address: '0xBA5246d78D8638Dd40D3a3C908CF92F8dC0769a1',
    chain: 'BNB Chain',
    type: '[Public] DegenPad IDO Sale',
    wallet: 'DegenPad - CGPT',
  },
  {
    address: '0x9fD9b062e80a3e8a4e672b28997cDa0331Aa7EC6',
    chain: 'BNB Chain',
    type: '[Private] ChainGPT Pad Private Sale',
    wallet: 'ChainGPT Pad - CGPT',
  },
  {
    address: '0x9c6d6cb058083F40a4f024bc15Fd528BC6b020B3',
    chain: 'BNB Chain',
    type: '[Private] ChainGPT Labs Investment Tokens $300k',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0x0D75540DFa0be7b15C2b01Bd4F2E26d93D8b3166',
    chain: 'BNB Chain',
    type: '[Private] ChainGPT Pad Team Investment $30k',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0xD87b86C8d403A43438bAE560AB27907B116B59A8',
    chain: 'BNB Chain',
    type: '[Reserve] ChainGPT Labs Incubation Fee Main',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0xfA7586b9204de077A8a0D9A3e164D46e394E1147',
    chain: 'BNB Chain',
    type: '[Reserve] ChainGPT Labs Incubation Fee Main',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0x5c58bdb28d6234dA0a85EF22643d441eEC205883',
    chain: 'BNB Chain',
    type: '[Marketing] ChainGPT Labs Incubation Fee Main',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0x9c13B49AC78AC521e2D9410F17586F5381F6616A',
    chain: 'BNB Chain',
    type: '[Marketing] ChainGPT Labs Incubation Fee Main',
    wallet: 'TeamFinance - CGPT',
  },
  {
    address: '0x5fE7c1859C37c1a8f820730C004BaFF754a797B2',
    chain: 'BNB Chain',
    type: '[Private] Omri $35k, CoinX $25k, $10k Unsold/Nick',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0x3B4370b8bfa6DBeCdbd51bE6C3475d1811647885',
    chain: 'BNB Chain',
    type: '[KOLs] ChainGPT & $AWARE KOLs Sale',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0x7bCa91fAaF5A6Ef0B30eFA2F034f58D6C2489C03',
    chain: 'BNB Chain',
    type: '[Marketing] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0xe6dd864bB892aC067900F8DA575EEBe4542A7938',
    chain: 'BNB Chain',
    type: '[Airdrop] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0x4d2275741b80fefbd1874abe4741849b8043741b',
    chain: 'BNB Chain',
    type: '[Liquidity] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0xc31B402a494aeB6b4E46059B87249706305FC995',
    chain: 'BNB Chain',
    type: '[Ecosystem] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0x0f82E57699FD884BC13c59844Db614F1A632dcFC',
    chain: 'BNB Chain',
    type: '[Staking] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  },
  {
    address: '0x25aeD87BEb83e0c4b74BfE8D2aaDe581c6C7f1C0',
    chain: 'BNB Chain',
    type: '[Team] ChainAware Company',
    wallet: 'TeamFinance - AWARE',
  }
];


async function getTotalSupply() {
  const cachedTotalSupply = cache.get('totalSupply');
  if (cachedTotalSupply !== undefined) {
    return cachedTotalSupply;
  }

  try {
    const url = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${cgptContractAddress}&apikey=${apiKey}`;
    const response = await axios.get(url);
    const result = response.data.result;

    cache.set('totalSupply', result); // Cache the total supply

    return result;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    throw error;
  }
}

// This is the home-page URL that will show a detailed list of the excluded addresses from the supply and all the data such as total supply, burnt supply, circulating supply, etc.
app.get('/', async (req, res) => {
  const cachedBalances = cache.get('balances');
  if (cachedBalances !== undefined) {
    res.send(cachedBalances);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
      
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      const bscScanLink = `https://bscscan.com/token/${cgptContractAddress}?a=${address}`;
 
      tableRows += `<tr>
      <td><a href="${bscScanLink}" target="_blank">${address}</a></td>
        <td>${Math.floor(balance / 10 ** 18).toLocaleString()}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = ` <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
  
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 20px;
      text-align: center;
    }
  
    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 10px;
    }
  
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      background-color: #fff;
    }
  
    th,
    td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
  
    th {
      background-color: #f9f9f9;
      font-weight: bold;
      font-size: 16px;
    }
  
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  
    a {
      color: #337ab7;
      text-decoration: underline;
    }
  
    a:hover {
      color: #23527c;
    }
  
    .title-row {
      background-color: #333;
      color: black;
      font-weight: bold;
      font-size: 18px;
    }
  
    .total-supply-row {
      background-color: #f9f9f9;
    }
  
    .empty-row {
      background-color: transparent;
    }
  
    /* Responsive Styles */
    @media screen and (max-width: 600px) {
      h1 {
        font-size: 24px;
      }
  
      p {
        font-size: 14px;
      }
  
      th,
      td {
        padding: 8px;
      }
    }
  </style>
  
  <h1>$AWARE Circulating Supply Tracker</h1>
  <p>Total Supply: 100,000,000</p>
  <p>Burnt $AWARE: ${burntTokens.toLocaleString()}</p>
  <p>Live Circulating Supply of $AWARE: ${totalSupply.toLocaleString()} </p>
  <br><br>
  <table>
    <tr class="title-row">
      <th>Contract Address</th>
      <th>Balance (AWARE)</th>
      <th>Chain</th>
      <th>Type</th>
      <th>Name</th>
    </tr>
    ${tableRows}
    <tr class="empty-row">
      <td colspan="5"></td>
    </tr>
    <tr class="total-supply-row">
      <td>$AWARE Circulating Supply</td>
      <td>${totalSupply.toLocaleString()}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>

    `;

    cache.set('balances', htmlResponse); // Cache the response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});



// This is an API endpoint that will show only the number of the circulating supply (normally used for CMC supply tracking)
app.get('/supply', async (req, res) => {
  const cachedSupply = cache.get('supply');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
      // Introduce a delay of 250ms (1 second / 4) between each API call
      await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18)}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = `${totalSupply}`;

    cache.set('supply', htmlResponse); // Cache the supply response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});


// This API endpoint will show the total supply
app.get('/totalsupply', async (req, res) => {
  const cachedSupply = cache.get('newtotal');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18)}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;
    const newTotalS = MaxSupply - burntTokens; 
    const htmlResponse = `${newTotalS}`;

    cache.set('newtotal', htmlResponse); // Cache the newtotal response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});



// This API endpoint will show the total tokens burnt
app.get('/burn', async (req, res) => {
  const cachedSupply = cache.get('burn');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18).toLocaleString()}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = `${burntTokens.toLocaleString()}`;

    cache.set('burn', htmlResponse); // Cache the burn response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
