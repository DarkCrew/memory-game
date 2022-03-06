const cards = document.querySelectorAll('.card');
const minutesElem = document.querySelector('.minutes');
const secondsElem = document.querySelector('.seconds');
const newGameBtn = document.querySelector('.button-new-game');
const timeScores = document.querySelectorAll('.time-score-container');
const scoreReloadBtn = document.querySelector('.score-reload');
const stepsHtml = document.querySelector('.steps-count');

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let startGame = true;
let countCardsFound = 0;
let countSteps = 0;
let minute = 0,
    second = 1,
    interval,
    currentAttempt = 0,
    btnNewGamedisabled = false,
    startWithBtn = false;
let arrScore = [];


newGameBtn.addEventListener('click', newGame);

function newGame() {
    countSteps = 0;
    startWithBtn = true;
    minute = 0;
    minutesElem.innerHTML = '00';
    second = -1;
    secondsElem.innerHTML = '00';
    flip();
    startTimer();
};

scoreReloadBtn.addEventListener('click', function () {
    if (!btnNewGamedisabled) {
        newGame();
        currentAttempt = 0;
        countSteps = 0;
        localStorage.removeItem('score');
        localStorage.removeItem('curAtt');
        arrScore = [];
        timeScores.forEach(elem => {
            while (elem.firstChild){
                elem.removeChild(elem.firstChild);
            }
        });
    }
});


// functions

function startTimer() {
    second++;
    if (second < 10) {
        secondsElem.innerHTML = '0' + second;
    }
    if (second > 59) {
        second = 0;
        minute++;
        if (minute < 10) {
            minutesElem.innerHTML = '0' + minute;
        }
        if (minute > 59) {
            //TODO
        }
        if (minute > 9) {
            minutesElem.innerHTML = minute;
        }
        secondsElem.innerHTML = '0' + second;
    }
    if (second > 9) {
        secondsElem.innerHTML = second;
    }
    console.log(minute);
    console.log(second);
    console.log('     ');
    if (minute === 60 && second === 1) {
        stopTimer();
    }
};

function stopTimer() {
    clearInterval(interval);
}

function disableButton() {
    if (btnNewGamedisabled) {
        newGameBtn.disabled = false;
        btnNewGamedisabled = false;
    } else {
        newGameBtn.disabled = true;
        btnNewGamedisabled = true;
    }
}

function loadScore() {
    let score = localStorage.getItem('score');
    if (score.length > 0) {
        arrScore = JSON.parse(score);
        score = JSON.parse(score);
    }

    if (parseInt(localStorage.getItem('curAtt')) > 0) {
        currentAttempt = parseInt(localStorage.getItem('curAtt'));
    }

    let currentPosition = 0;
    timeScores.forEach(time => {

        let timeScoreNew = document.createElement('div');
        timeScoreNew.classList.add('time-score');
        timeScoreNew.innerHTML = `
            <p class="position">${currentPosition + 1}.</p>
            <p class="time-info">${score[currentPosition].minutes} minute : ${score[currentPosition].seconds} seconds</p>
        `

        let countScoreStepsNew = document.createElement('div');
        countScoreStepsNew.classList.add('count-steps');
        countScoreStepsNew.innerHTML = `
            <p>Steps: </p>
            <p class="steps-info">${score[currentPosition].steps}</p>
        `
        
        time.append(timeScoreNew, countScoreStepsNew);

        currentPosition++;
    });
}

loadScore();


function flip() {
    if (startGame) {
        cards.forEach(card => {
            card.classList.remove('flip');
            card.addEventListener('click', flip);
        });
        countCardsFound = 0;
        clearInterval(interval);
        interval = setInterval(startTimer, 1000);
        disableButton();
        setTimeout(() => {
            cards.forEach(card => {
                card.classList.add('ready');
            });
            shuffleCards();
        }, 1000);
        startGame = false;
        if (startWithBtn) return;
    }
    if (lockBoard) return;
    if (this === firstCard) return;

    console.log(this);
    this.classList.add('flip');

    if (!hasFlippedCard) {
        // first click
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    // second click
    secondCard = this;
    checkMatch();
}

function checkMatch() {
    firstCard.dataset.image === secondCard.dataset.image ? deleveFlipWhenMatch() : deleteUnflipCards();
};

function deleveFlipWhenMatch() {
    countSteps++;
    stepsHtml.textContent = `${countSteps}`;
    firstCard.removeEventListener('click', flip);
    secondCard.removeEventListener('click', flip);
    countCardsFound++;
    if (countCardsFound === 10) {
        stopTimer();

        if (currentAttempt > (timeScores.length - 1)) {
            arrScore.shift();
            arrScore.push({
                minutes: minute,
                seconds: second,
                steps: countSteps
            });
        } else {
            arrScore[currentAttempt] = {
                minutes: minute,
                seconds: second,
                steps: countSteps
            };
        }

        localStorage.setItem('score', JSON.stringify(arrScore));
        let score = localStorage.getItem('score');
        score = JSON.parse(score);

        if (currentAttempt > (timeScores.length - 1)) {
            let currentPosition = 0;
            timeScores.forEach(time => {
                console.log(time);
                time.removeChild(time.firstChild);

                let timeScoreNew = document.createElement('div');
                timeScoreNew.classList.add('time-score');
                timeScoreNew.innerHTML = `
                    <p class="position">${currentPosition + 1}.</p>
                    <p class="time-info">${score[currentPosition].minutes} minute : ${score[currentPosition].seconds} seconds</p>
                `
                
                let countScoreSteps = document.createElement('div');
                countScoreSteps.classList.add('count-steps');
                countScoreSteps.innerHTML = `
                    <p>Steps: </p>
                    <p class="steps-info">${score[currentPosition].steps}</p>
                `
                
                time.append(timeScoreNew, countScoreSteps);

                currentPosition++;
            });
            currentAttempt++;
            localStorage.setItem('curAtt', currentAttempt);
        } else {
            let timeScore = document.createElement('div');
            timeScore.classList.add('time-score');
            timeScore.innerHTML = `
                <p class="position">${currentAttempt + 1}.</p>
                <p class="time-info">${score[currentAttempt].minutes} minute : ${score[currentAttempt].seconds} seconds</p>
            `

            let countScoreSteps = document.createElement('div');
            countScoreSteps.classList.add('count-steps');
            countScoreSteps.innerHTML = `
                <p>Steps: </p>
                <p class="steps-info">${score[currentAttempt].steps}</p>
            `

            for (let i = 0; i < timeScores.length; i++) {
                if (i === currentAttempt) {
                    timeScores[i].append(timeScore, countScoreSteps);
                    break;
                }
            }

            currentAttempt++;
            localStorage.setItem('curAtt', currentAttempt);
        }

        startGame = true;
        disableButton();
    }
    resetBoard();
};

function deleteUnflipCards() {
    countSteps++;
    stepsHtml.textContent = `${countSteps}`;
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        setTimeout(() => {
            resetBoard();
        }, 500);
    }, 1500);
}


function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function shuffleCards() {
    cards.forEach(card => {
        const randomNum = Math.floor(Math.random() * cards.length);
        card.style.order = randomNum;
    });
}
