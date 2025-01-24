var express = require('express');
var router = express.Router();
const fs = require("fs");
const userDBFileName = "./model/userDB.json";
const { getCollection } = require('../model/db');
const axios = require('axios');
var activeUser


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
    const {username, password} = req.body;
    const users = readUserDB();


    let flag = false;
    let fullName;

    //finding user
    // Check in the JSON file
    users.forEach((item) => {
        if (item.username === username && item.password === password) {
            flag = true;
            fullName = item.name;
            activeUser = item;
            
        }
    });



    console.log("The active user: ", activeUser);
    console.log("\n\nLOGIN SUBMIT This is the current highest score: ", activeUser.highest_score);

//if user is found send to home page with user data
    if(flag){
        let username = activeUser.username
        let highScore = activeUser.highest_score;
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


    for (let user of userDB){
        if(user.username === username){
            flag = true;

        }
        await userCollection.insertOne({ name, username, password, highestScore:0 });
        res.render('login', { errorMessage: null });
    } catch (e) {
        console.error("Error saving user to MongoDB:", e);
        res.status(500).send("Failed to save DB");
    }
});


async function fetchApiData(question_amount, categories, difficulty){
    let quiz_questions = `https://opentdb.com/api.php?amount=${question_amount}&category=${categories}&difficulty=${difficulty}&type=multiple`;
    try{
      let response = await axios.get(quiz_questions);
      response = response.data;
      return response;
    }
    catch(error){
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
  
//makes the api calls to get question categories and other quiz options
router.post("/login/submit/userOptions", async (req, res) => {
    

    const data = {
        questionAmount: req.body.num_questions,
        timeLimit: req.body.time_limit,
        categories: req.body.categoryOptions,
    }
    let apiData = await fetchApiData(data.questionAmount, data.categories, data.difficulty);
    let selectedQuestion = createQuestionObj(apiData);
    console.log(selectedQuestion);
    res.render("quiz", 
        {
            questions: selectedQuestion, 
            time_limit: data.timeLimit,
            activeUser
        });
        console.log("\n\nQUIZ OPTIONS: This is the current highest score: ", activeUser.highest_score);
});


// This will show the result page
router.post('/login/submit/userOptions/quiz', (req, res) => {

    const { questions, answerKey, userResponse} = req.body;
    console.log("\n\n RESULTSSS : This is the current highest score: ", activeUser.highest_score);


    res.render('results', 
        { 
            questions: JSON.parse(questions), 
            answers: JSON.parse(answerKey), 
            userResponse: JSON.parse(userResponse),
            userScore: activeUser.highestscore
        }
    );
});


router.get('/home', async function(req, res) {
    res.render('home');

});


router.get('/userOptions', function(req, res) {
    res.render('userOptions');

});




module.exports = router;