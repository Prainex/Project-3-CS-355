How to Run:
Ensure you have NPM installed.
Run "npm start" to run the server on port 3001
In web brower enter: (http://localhost:3001/) to see quiz application.

Team:
Alyssa Castillano
Arvind Majumder
Aminul Haque

Name: Alyssa Castillano
Page created: HomePage/Sign-in/Sign-up

Functionality:
1. Homepage allows a user to sign-in or sign-up
2. Accepts the new users
3. If user is new stores the users into a json
4. Sending information from the sign up page to be validated before the quiz.
5. CSS throughout the website.



Name: Arvind Majumder
Page created: Leaderboard

Functionality:
1. Accepts and processes data passed from the results page.
2. Created interactive display of leaderboard table
3. Dynamically displayed relevant and accurate data of scores for each user
4. Updates the leaderboard with an updated view of the highest score per game.
5. Merging of all team member's code.



Name: Aminul Haque
Page created: Quiz

Page functionality: 

1. Receives the questions for the quiz and the time allocated for each question as input from the previous page.
2. Then extract the question from that object and initially display the first question that is in the object.
3. Extract the options and the answer for the corresponding question and display them. 
4. Once the question and the options are displayed, the user gets a certain amount of time to choose an answer. 
5. If the user doesn't choose an answer within the allocated time then they will get 0 point for that question and the next question will be displayed.
6. There are two ways to move to the next question: let the time run out or simply click on the next button.
7. If user click on the next button, the next question will be displayed and the time will be reset. 
8. Every time a question is displayed, the user response from the previous question is recorded in an array. 
9. Once all the questions has been displayed, this page will send the following information to the server: an array consisting of the questions, an array
consisting of the correct answer choices for that question and an array that contains the options that user selected for each question.
