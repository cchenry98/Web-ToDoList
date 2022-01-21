// jshint esversion:6

const express = require("express");
const https = require("https");
// for parsing the body of the html by name, id, etc...
const bodyParser = require("body-parser");
// Use my data.js file to get Date
const date = require(__dirname + "/date.js");

const mongoose = require("mongoose");
// Lowdash library
const _ = require("lodash");
require('dotenv').config()

const login = process.env.DB_CRED;

// mongoose.connect("mongodb+srv://" + login + "@cluster0.89mns.mongodb.net/todolistDB?retryWrites=true&w=majority", {
//   useNewUrlParser: true
// });

// Testing locally
mongoose.connect("mongodb://localhost:27017/blogdb", {useNewUrlParser:true});

const app = express();
// .set needs to be after const app declaration
// for using ejs templetes
app.set('view engine', 'ejs');

// for passing html post. extended = ture lets us post nested objects
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// For the todo items check list
// JavaScript allows you to add or push to a const array. Just can't reassign the array
// const newItems = ["Make food list", "Pick up food", "Eat Food"];
// // For the work items
// const workItems = [];

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list"
});
const item2 = new Item({
  name: "Hit the + to add a new item"
});
const item3 = new Item({
  name: "<-- Hit to delete an item"
});

const defaultItems = [item1, item2, item3];

// New schema to determine the type of list for multiple lists by list name
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
// Model for new lists schema
const List = mongoose.model("List", listSchema);

const day = date.getDay();

app.get("/", function(req, res) {

  Item.find({}, function(err, docs) {
    if (docs.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Array items entered in todoitemsDB.");
        }
      })
      res.redirect("/")
    }
    if (err) {
      console.log(err);
    } else {
      // The name part in the javascipt object is the name in the .ejs file. The value is the current scope letiable in the function
      res.render('lists', {
        listTitle: day,
        newItem: docs
      });
    }
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.lists

  const newItem = new Item({
    name: itemName
  });
  // Check to see if the List is the default or home route before adding from the button post of a new item
  if (listName === day) {
    newItem.save();
    res.redirect("/");
  }
  // Post the new itme to the correct list using the parameter entered after the home route
  else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function(req, res) {
  const removeItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(removeItem, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("ID " + removeItem + " removed from todoListDB");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: removeItem
        }
      }
    }, function(err, item) {
      // add a new one
      if (!err) {
        res.redirect("/" + listName);
      };
    });
  }
});
app.get("/:listName", function(req, res) {
  // Display the new page for a dynamically added list
  const listName = _.capitalize(req.params.listName);

  List.findOne({
    name: listName
  }, function(err, item) {
    // add a new one
    if (!err) {
      if (!item) {
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listName);
      }
      // render a current one.
      else {
        res.render("lists", {
          listTitle: item.name,
          newItem: item.items
        })
      }
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started successfully on port " + port)
})
