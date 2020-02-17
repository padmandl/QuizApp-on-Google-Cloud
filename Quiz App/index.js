const admin = require('firebase-admin');
const functions = require('firebase-functions');


admin.initializeApp(functions.config().firebase);

const db = admin.firestore();


const countQuestions = 2;//no of questions


let question_template = ({
    id,
    title,
    option1,
    option2,
    option3,
    option4
}) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <h1>QUIZ APPLICATION</h1>
          <h2 style="color: blue;">Vamsi Bhavani Channel</h2>
          <form name="quizform" action="/checkanswer" method="POST">
            <input type="hidden" name="id" value="${id}">
            <p><strong>${title}</strong></p>
            <select name="answer">
                <option value="1">${option1}</option>
                <option value="2">${option2}</option>
                <option value="3">${option3}</option>
                <option value="4">${option4}</option>
            </select>
            <input name="submit" type="submit"/>
          </form>
        </body>
      </html>`;
}


let correct_answer_template = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <h2>Hurray</h2>
          <p>Your answer is correct. <a href="/getRandomQuestion">Answer another question</a></p>
        </body>
      </html>`;
}


let wrong_answer_template = ({
    correct_answer
}) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <h2>Better Luck Next Time</h2>
          <p>The correct is ${correct_answer}. <a href="/getRandomQuestion">Answer another question</a></p>
        </body>
      </html>`;
}


exports.getRandomQuestion = (req, res) => {

    
    const id = Math.floor(Math.random() * (countQuestions) + 1)
    var questionRef = db.collection('questions').doc(id.toString());
    var getDoc = questionRef.get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error("No such document");
            } else {
                console.log('Document data:', doc.data());
                res.status(200).send(question_template({
                    id: doc.id,
                    title: doc.get('title'),
                    option1: doc.get('option1'),
                    option2: doc.get('option2'),
                    option3: doc.get('option3'),
                    option4: doc.get('option4')
                }));
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
            res.status(400).send('Error');
        });
}


exports.checkanswer = (req, res) => {

    
    let id = req.body.id;
    let answer = req.body.answer;

    var questionRef = db.collection('questions').doc(id.toString());
    var getDoc = questionRef.get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error("No such document");
            } else {
                if (doc.get('answer') === answer) {
                    res.status(200).send(correct_answer_template());
                } else {
                    res.status(200).send(wrong_answer_template({
                        correct_answer: getAnswer(doc, doc.get('answer'))
                    }));
                }
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
            res.status(400).send('Error');
        });
}


function getAnswer(doc, answer) {
    let answer_text = "";
    switch (answer) {
        case "1":
            answer_text = doc.get('option1');
            break;
        case "2":
            answer_text = doc.get('option2');
            break;
        case "3":
            answer_text = doc.get('option3');
            break;
        case "4":
            answer_text = doc.get('option4');
            break;
    }
    return answer_text;
}