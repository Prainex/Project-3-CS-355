var express = require('express');
const path = require("path");
var router = express.Router();
const collection = require('./configDB');
const axios = require('axios');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req,res){
  res.render('login', {errorMessage: null});
});

router.get("/signup", function(req,res){
  res.render("signup", {errorMessage: null});
});

router.get("/login/userOptions", function(req,res){
  res.render("userOptions", {title: null});
});

router.get("/login/userOptions/quiz", function(req,res){
  res.render("quiz", {questions: null, time_limit: null});
});

router.get("/login/userOptions/quiz/results", function(req,res) {
  res.render("results");
})

//Register user
router.post("/signup", async (req, res) =>{

  // Create an object array to send to the database
  const data = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    highest_score: "0"
  };

  const users = await collection.find({}); // Retrieve all data from the database

  let flag = true;
  users.forEach((item) => {
    if(item.username === data.username){
      flag = false;
    }
  });

  if(flag){
    const userData = await collection.insertMany(data); // Send data to the database
    res.render('login', {errorMessage: null});
  }
  else{
    res.render('signup', {errorMessage:"Username already exists"});
  }
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

// Login user
router.post("/login", async (req, res) => {
  const users = await collection.find({}); // retrieve all data from the database

  const data = {
    username: req.body.username,
    password: req.body.password,
  };

  let flag = false;
  let fullName;

  users.forEach((item) => {
    if (item.username === data.username && item.password === data.password) {
      flag = true;
      fullName = item.name;
    }
  });

  if (flag) {
    try {
      let [categoryOptions, categoryId] = await getCategories();
      // console.log("CategoryID: ", categoryId);
      // console.log("CategoryOptions: ", categoryOptions);
      let difficultyOptions = ["Easy", "Medium", "Hard"];
      res.render('userOptions', {
        title: fullName,
        categories: categoryOptions,
        difficulties: difficultyOptions,
        categoryId: categoryId
      });
    } catch (error) {
      console.error("Error fetching categories: ", error.message);
      res.render('login', { errorMessage: "Error loading user options." });
    }
  } else {
    res.render('login', { errorMessage: "Invalid username or password" });
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


//Get user options 
router.post("/login/userOptions", async (req, res) => {
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

router.post("/login/userOptions/quiz", (req,res) => {

  const { questions, answerKey, userResponse } = req.body;

  res.render('results', { 
      questions: JSON.parse(questions), 
      answers: JSON.parse(answerKey), 
      userResponse: JSON.parse(userResponse)
  });
});

router.post("/login/userOptions/quiz/results", async (req,res) =>{
  const users = await collection.find({});
  const sortedUsers = users.sort((a, b) => b.highest_score - a.highest_score);
  res.render('login', { leaderboard: sortedUsers });
})


module.exports = router;
