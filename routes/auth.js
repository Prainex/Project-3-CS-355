var express = require('express');
var router = express.Router();
const fs = require("fs");
const userDBFileName = "./model/userDB.json";
const axios = require('axios');


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

    users.forEach((item) => {
        if (item.username === username && item.password === password){
            flag = true;
            fullName = item.name;
        }
    });

    if(flag){
        try{
            let[categoryOptions, categoryId] = await getCategories();
            let difficultyOptions = ["Easy", "Medium", "Hard"];
            res.render('userOptions', {
              title: fullName,
              categories: categoryOptions,
              difficulties: difficultyOptions,
              categoryId: categoryId
            });
        }
        catch(e){
            console.error(e);
        }
    }
    else{
        res.render('login', {errorMessage: "Invalid username or password"});
    }

});


router.post("/signup/submit", (req, res) => {
    let userDB = readUserDB();
    let flag = false;
    const { name, username, password} = req.body;

    for (let user of userDB){
        if(user.username === username){
            flag = true;
        }
    }

    if(flag){
        res.render('signup', { errorMessage: "Username already exists" });
    }

    else{
        userDB.push({ name, username, password, highest_score: 0 });
        writeUserDB(userDB);
        res.render('login', { errorMessage: null });
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
  

router.post("/login/submit/userOptions", async (req, res) => {
    const data = {
        questionAmount: req.body.num_questions,
        timeLimit: req.body.time_limit,
        categories: req.body.categoryOptions,
        difficulty: req.body.difficultyOptions
    }
    let apiData = await fetchApiData(data.questionAmount, data.categories, data.difficulty);
    let selectedQuestion = createQuestionObj(apiData);
    console.log(selectedQuestion);
    res.render("quiz", {questions: selectedQuestion, time_limit: data.timeLimit});
});


// This will show the result page
router.post('/login/submit/userOptions/quiz', (req, res) => {

    const { questions, answerKey, userResponse } = req.body;
    res.render('results', { 
        questions: JSON.parse(questions), 
        answers: JSON.parse(answerKey), 
        userResponse: JSON.parse(userResponse)
    });
});




module.exports = router;