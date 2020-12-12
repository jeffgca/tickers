const _ = require('lodash');
const fetch = require('node-fetch');
const tickersUrl = 'https://www.tsx.com/json/company-directory/search/tsx/.*';
const stringify = require('csv-stringify');
const { DateTime } = require("luxon");

const yargs = require('yargs');

let fields = ['marketcap', 'price', 'change', 'high52', 'low52', 'volume', 'volumeavg'];
let headers = _.flatten(['name', 'symbol', fields]);

// return a google finance formula string

function getFirstTradingDay(year /* YYYY */) {
  let _dt = DateTime.local(year, 1, 2);
  let _wday = _dt.weekday;
  if (_wday >= 1 && _wday < 6) {
    return _dt;
  }
  if (_wday === 6) { // Saturday, so Jan 4
    return _dt.plus({days: 2});
  } else {
    // Sunday, so Jan 3
    return _dt.plus({days: 1});
  }
}

function gf(symbol, param, prefix) {
  if (prefix) { 
    symbol = `${prefix}:${symbol}`;
  }
  return `=GoogleFinance("${symbol}","${param}")`;
}

function fromDate(symbol, date, prefix) {
  return `=INDEX(GoogleFinance("${prefix}:${symbol}","PRICE", DATE(${date.year},${date.month},${date.day}), "1"),2,2)`;
}

function fromStartOfYear(symbol, year /** int YYYY */, prefix) {
  let _dt = getFirstTradingDay(year);
  return fromDate(symbol, _dt, prefix);
}

function genFormulas(symbol, prefix) {
  let _standard = _.map(fields, (param) => {
    return gf(symbol, param, prefix);
  });
  let jan1 = fromStartOfYear(symbol, 2020, prefix);
  _standard.push(jan1);
  return _standard;
}

// yargs' missing hideBin
function hideBin() {
  return process.argv.slice(2);
}

if (require.main === module) {

/**
 * 1. get all tickers
 * 2. create big csv data that includes listed tickers plus formula fields
 * 3. upload to a new sheet in our doc? new doc? 
 */

  (async () => {
    fetch(tickersUrl)
      .then(response => response.json())
      .then((json) => {
        // console.log(json);
        let allSymbols = _.compact(_.map(json.results, (ticker) => {
          if (/^[\w]+?\.[\w]+?/.test(ticker.symbol)) {
            // console.log('Caught: ', ticker.symbol);
            
            return false;
          }
          let _f = genFormulas(ticker.symbol, 'TSE');
          return _.flatten([ticker.name, ticker.symbol, genFormulas(ticker.symbol, 'TSE')]);
        }));

        headers.push('Start of Year')
  
        // allSymbols.length = 20;
        allSymbols.unshift(headers);
  
        stringify(allSymbols, {delimiter: '\t'}, (err, result) => {
          if (err) throw err;
          console.log(result);  
        });

        // console.log(_.map(allSymbols, (s) => { return s[1]}));
        
      })
      .catch((err) => {
        throw err;
    });
  })();

}


