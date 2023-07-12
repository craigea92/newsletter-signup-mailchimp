// Importing the privateInfo object from the "./apiKey" module
const { privateInfo } = require("./apiKey");

// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");

// Creating an instance of the Express application
const app = express();

// Serving static files from the "public" directory
app.use(express.static("public"));

// Parsing URL-encoded bodies using the bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Handling GET requests to the root ("/") route
app.get("/", function(req, res){
  // Sending the "sign-up.html" file as the response
  res.sendFile(__dirname + "/sign-up.html");
});

// Handling POST requests to the root ("/") route
app.post("/", function(req, res){
  // Extracting data from the request body
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  // Constructing data object for Mailchimp API request
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  // Converting data object to JSON string
  const jsonData = JSON.stringify(data);

  // Constructing the URL for the Mailchimp API request
  const url = "https://us18.api.mailchimp.com/3.0/lists/" + privateInfo.listId;

  // Constructing options for the HTTPS request
  const options = {
    method: "POST",
    auth: "craig:" + privateInfo.apiKey
  };
  
  // Sending an HTTPS request to the Mailchimp API
  const request = https.request(url, options, function(response){
    
    // Checking the response status code
    if (response.statusCode === 200) {
      // Sending the "success.html" file as the response
      res.sendFile(__dirname + "/success.html");
    } else {
      // Sending the "failure.html" file as the response
      res.send(__dirname + "/failure.html");
    }
    
    // Listening for the "data" event on the response
    response.on("data", function(data){
      console.log(JSON.parse(data));
    });
  });

  // Writing the JSON data to the request body
  request.write(jsonData);

  // Sending the request
  request.end();
});

// Handling POST requests to the "/failure" route
app.post("/failure", function(req, res){
  // Redirecting the user back to the root ("/") route
  res.redirect("/");
});

// Starting the server and listening on port 3000
app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
