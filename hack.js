const _ = require('lodash');
const { DateTime } = require("luxon");

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

_.each([
  2010, 2011, 2019, 2020
], (year) => {
  console.log(getFirstTradingDay(year).toObject());
  
})


// console.log('2020>', getFirstTradingDay(2020).toJSDate());
// console.log('2019>', getFirstTradingDay(2019).toJSDate());
// console.log('2016>', getFirstTradingDay(2016).toJSDate());

