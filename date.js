

exports.getDate = function() {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const today = new Date();
  return today.toLocaleDateString("en-US", options)

}

exports.getDay = function() {
  const options = {
    weekday: 'long',
  };
  const today = new Date();
  return today.toLocaleString('en-us', {  weekday: 'long' })

}

exports.getYear = function() {
  const options = {
    year: 'numeric',
  };
  const year = new Date().getFullYear();
  return year

}
