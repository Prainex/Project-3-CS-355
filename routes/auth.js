var express = require('express');
var router = express.Router();
const fs = require("fs");
const userDBFileName = "./model/userDB.json";
const axios = require('axios');
const { getCollection } = require('../model/db');
var activeUser
var id = "";


function readUserDB() {
    let data = fs.readFileSync(userDBFileName, "utf-8");
    return JSON.parse(data);
}

function writeUserDB(users){
    let data = JSON.stringify(users, null, 2);
    fs.writeFileSync(userDBFileName, data, "utf-8");
}


router.get('/login', function(req, res) {
    res.render('login', { errorMessage: null });
});


router.get('/signup', function(req, res) {
    res.render('signup', { errorMessage: null });
});

async function getCategories(){
    const quiz_categories = 'https://opentdb.com/api_category.php';
    try{
      let response = await axios.get(quiz_categories);
      response = response.data;
      let arr1 = [];
      let arr2 = [];
      response.trivia_categories.forEach((item) =>{
        arr1.push(item.name);
        arr2.push(item.id);
      })
      return [arr1, arr2];
    }
    catch(error){
      console.error("Error fetching categories: ", error.message);
    }
  }


router.post("/login/submit", async (req, res) => {
    const { username, password } = req.body;

    const users = readUserDB(); 
    const userCollection = getCollection('users'); 
    

    let flag = false;
    let fullName;

    // Check in the JSON file
    users.forEach((item) => {
        if (item.username === username && item.password === password) {
            flag = true;
            fullName = item.name;
            activeUser = item;
            
        }
    });

    if (!flag) {
        try {
            const user = await userCollection.findOne({ username, password });
            if (user) {
                flag = true;
                fullName = user.name;
                activeUser = user;
                id = user._id;
            }
        } catch (e) {
            console.error("Error accessing MongoDB:", e);
        }
    }


    console.log("The active user ID: ", id);
    console.log("\n\nLOGIN SUBMIT This is the current highest score: ", activeUser.highestScore);

//if user is found send to home page with user data
    if(flag){
        let username = activeUser.username
        let highScore = activeUser.highestScore;
        let games = [];
        games = activeUser.games;
        res.render('home', {
            title: fullName,
            username:username,
            highScore: highScore,
            games,
        });
    }else res.render('login', {errorMessage: "Invalid username or password"});
    

    
});



router.post("/signup/submit", async (req, res) => {
    const userCollection = getCollection('users');
    const { name, username, password } = req.body;

    try {
        const existingUser = await userCollection.findOne({ username });
        if (existingUser) {
            return res.render('signup', { errorMessage: "Username already exists" });
        } else {
            let games = [];
            await userCollection.insertOne({ name, username, password, highestScore:0, games});
            res.render('login', { errorMessage: null });
        } 
        
    } catch (e) {
        console.error("Error saving user to MongoDB:", e);
        res.status(500).send("Failed to save DB");
    }
});


async function fetchApiData(question_amount) {
    let quiz_questions = `https://opentdb.com/api.php?amount=${question_amount}&type=multiple`;
    try {
        let response = await axios.get(quiz_questions);
        response = response.data;
        return response;
    } catch (error) {
        console.log("Error fetching data ", error.message);
    }
}


function createQuestionObj(data) {
    const questions = [];
  
    data.results.forEach((item) => {
      const options = [item.correct_answer, ...item.incorrect_answers];
  
      options.sort(() => Math.random() - 0.5);
  
      const correctAnswerLetter = ['A', 'B', 'C', 'D'][options.indexOf(item.correct_answer)];
  
      const questionObj = {
        question: item.question,
        A: options[0],
        B: options[1],
        C: options[2],
        D: options[3],
        answer: correctAnswerLetter
      };
  
      questions.push(questionObj);
    });
  
    return questions;
  }

  
router.post("/login/submit/userOptions", async (req, res) => {
    

    const data = {
        questionAmount: req.body.num_questions,
        timeLimit: req.body.time_limit,
    }

    let apiData = await fetchApiData(data.questionAmount);
    let selectedQuestion = createQuestionObj(apiData);
    console.log(selectedQuestion);
    res.render("quiz", 
        {
            questions: selectedQuestion, 
            time_limit: data.timeLimit,
        });
});


// This will show the result page
router.post('/login/submit/userOptions/quiz', async (req, res) => {
    const userCollection = getCollection('users');
    const { questions, answerKey, userResponse } = req.body;
    let correctResponse = JSON.parse(answerKey);
    let quizAnswers = JSON.parse(userResponse);
    let score = 0;

     for(let i = 0; i < quizAnswers.length; i++){
        if(quizAnswers[i] === correctResponse[i]){
            score++;
        }
    }
    let percentage = (score / quizAnswers.length)*100

    const user = await userCollection.findOne(id);
    if(user.highestScore < percentage) user.highestScore = percentage;

    res.render('results', { 
        questions: JSON.parse(questions), 
        answers: JSON.parse(answerKey), 
        userResponse: JSON.parse(userResponse)
    });
});


router.get('/home', async function(req, res) {
    res.render('home');

});


router.post('/userOptions', function(req, res) {
    res.render("userOptions", {title: activeUser.name});
});

module.exports = router;