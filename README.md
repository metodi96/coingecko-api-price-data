# Description
Use the coingecko api to read data from an .xlsx file containing rows with the name of an asset and a given date and output a new .xlsx file with a price column.\
Due to the rate limit of roughly 50 requests/minute, the script is configured in a way such that it does not hit it. It sends 1 request every 1.3 seconds.

## Instructions

### Step 1: 
Make sure to create a test.xlsx file with the following example structure:

| bitcoin     | 04-12-2020  |
| ethereum    | 05-05-2021  |
| avalanche   | 10-10-2021  |
| fantom      | 15-12-2021  |

### Step 2:
Install dependencies:
> npm install

### Step 3:
Run script with:
> npm start 