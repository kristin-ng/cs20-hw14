const MongoClient = require("mongodb").MongoClient;
const csvParser = require("csv-parser");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// connection string
const url =
  "mongodb+srv://kristin-ng:y8791935K@cluster0.sgmfn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// File with data to fill database with
const dataFile = "companies.csv";

// main driver functions to open connection to mongo db to start filling db.
function main() {
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
    if (err) {
      console.log("Connection to Mongo err: " + err);
      return;
    }

    // get database and collection object
    var dbo = database.db("StockDB");
    var collection = dbo.collection("companies");

    console.log("Success connecting to DB!! :)");

    parseWithCSVParser(collection, database);
  });
}

// read from companies.csv file and insert to database
function parseWithCSVParser(coll, db) {
  var dataArr = [];
  fs.createReadStream(path.join(__dirname, "", dataFile))
    .on("error", function () {
      console.log(`An error ocurred while reading file :(`);
    })
    .pipe(csvParser())
    .on("data", function (row) {
      var newData = objectWithCustomKeys(row);
      dataArr.push(newData);
    })
    .on("end", function () {
      coll.insertMany(dataArr, (err, res) => {
        if (err) throw err;
        console.log(`Inserted ${res.insertedCount} documents`);
        db.close();
      });
    });
}

// Returns an object to be inserted to database with custom key fields.
function objectWithCustomKeys(rowObj) {
  return { name: rowObj.Company, ticker: rowObj.Ticker };
}

main();
