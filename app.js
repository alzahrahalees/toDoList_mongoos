//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose")
const date = require(__dirname + "/date.js");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect(process.env.MONGO_LINK);
//mongoose.connect('mongodb://127.0.0.1:27017/todoList')

const itemSchema= mongoose.Schema({
  name:{
    type: String,
    required:true
  }
});

const listSchema= mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const Item= mongoose.model("Item",itemSchema)
const List= mongoose.model("List", listSchema)

let item1= new Item({
  name: "Task number 1"
})

let item2= new Item({
  name: "Task number 2"
})

let item3= new Item({
  name: "Task number 3"
})

const defaultItemList= [item1,item2,item3]


app.get("/", function(req, res) {
  const day = date.getDate();
  const items = [];
  Item.find({},function(err, elements){
    if(err) {
      console.log(err);
    }
    else{
      elements.forEach(element => {
        items.push(element)
      });
      res.render("list", {listTitle: day, newListItems: items});
    }
  
  })
  

});

app.get("/:category",(req,res)=>{
  const customListname=_.capitalize(req.params.category);

  List.findOne({name: customListname},function(err, results){
   

    if(err) {
      console.log(err);
    }
    else if(!results){
      const list = new List({
        name:  customListname,
        items: []
      }).save().then(()=>res.redirect("/"+customListname))
      
    }
    else{
      res.render("list",{listTitle: customListname, newListItems: results.items})
    }
  })

})

app.post("/", function(req, res){

  const item = req.body.newItem? req.body.newItem:"  ";
  const listName=req.body.list


    var newItem = new Item({
      name: item
    })

    if(listName === date.getDate()){
      newItem.save()
      res.redirect("/")
    }
    else{
      List.findOne({name: listName},(err,result)=>{
        if (err) console.log(err);
        else{
    
          result.items.push(newItem)
          result.save().then(()=>res.redirect("/"+listName))
          
        }
      })
    }


});

app.post("/delete", (req,res)=>{
  const checkId= req.body.checkbox
  const listName= req.body.listName

  if(listName === date.getDate()){
    Item.deleteOne({_id: checkId},function(err){
      if(err) console.log(err);
      else{
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkId}}},(err,foundList)=>{
      if(err) console.log(err)
      else res.redirect("/"+listName)

    })
  }
  
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
