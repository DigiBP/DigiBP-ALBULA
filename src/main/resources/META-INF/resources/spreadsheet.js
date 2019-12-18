var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var fs = require('fs');
request = require('request');
var https = require('https');
function extractURL(dataURI) {
  // separate out the mime component
  var mimeString = dataURI.split('"')[1].split('"')[0]
  //mimeString = mimeString.replace('"','')
  return mimeString;
}
var download = function(uri, filename){
  request.head(uri, function(err, res, body){
  request(uri).pipe(fs.createWriteStream(filename))
  console.log("images are up to date");
});
};

// Create a document object using the ID of the spreadsheet - obtained from its URL.
var doc = new GoogleSpreadsheet('1hZ8hSMVrYOTRgKt57JnVF_cJR7W986TOV_TzKLGW990');
doc.makeFeedRequest('')
// Authenticate with the Google Spreadsheets API.
var minutes = 0.7, the_interval = minutes * 60 * 1000;
setInterval(function() {
  doc.useServiceAccountAuth(creds, async function (err) {
  names = [];
  await doc.getRows(1, function (err, rows) {
    for (i = 0; i < rows.length; i++){
      row = rows[i]   
      name = row.firstname
      lastname = row.lastname
      fullName = name+' '+ lastname
      names.push(fullName)
    } 
  })
  await doc.getCells(1,{
    'min-col': 25,
    'max-col': 25,
    'return-empty': false
  }, async function (err, cells){
      var i 
      for (i = 1; i< names.length+1; i++) {
        cell = cells[i]
        path = './dbImages/'+names[i-1]+'.'+'jpg'
        imageURL = cell._formula
        if (imageURL && !fs.existsSync(path)){
          console.log("imageUrl:"+imageURL)
          url = extractURL(imageURL)
          newUrl = url.split('.jpg')[0]+".jpg"
          //console.log("new Url: " + url)
          await download(url, path);
        }
      }
    }
  )
  // Get all of the rows from the spreadsheet.
});
}, the_interval);