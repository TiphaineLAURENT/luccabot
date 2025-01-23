// ==UserScript==
// @name        LuccaFaces bot
// @namespace   Violentmonkey Scripts
// @match       https://polyconseil.ilucca.net/faces/home
// @grant       none
// @version     1.0
// @author      Tiphaine LAURENT
// @description 1/2/2025, 11:46:29 PM
// @run-at      document-end
// ==/UserScript==

(async () => {
  const MAX_POSSIBLE_SCORE = 170;
  const TIME_PER_SCORE = 30;  // ms
  const target = 1549;

  const STORAGE_KEY = "lucca_bot";
  const answers = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};

  const sleep = (duration) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  const addBotButton = async () => {
    await sleep(200);  // Wait for buttons to appear
    const trainButton = document.querySelector('[transloco="TRAINING_TITLE_BUTTON"]');
    const botButton = trainButton.cloneNode(true);
    botButton.innerText = "Bot";
    botButton.onclick = async (event) => {
      event.preventDefault();
      const playButton = document.querySelector('[transloco="PLAY"]');
      playButton.click();
      startGame();
    }
    trainButton.after(botButton);
  }

  const handleFinish = async () => {
    await sleep(500);
    const replayButton = document.querySelector('[transloco="RANKINGS"] + button');
    if (!replayButton) {
      return;
    }

    replayButton.addEventListener('click', startGame);
  }

  const startGame = async () => {
    await sleep(500);

    const game = document.querySelector(".gameContainer");
    const gameObserver = new MutationObserver(async (mutations) => {
      await handleFinish();
    });
    gameObserver.observe(game, { childList: true });

    const goButton = document.querySelector("button.rotation-loader");
    goButton.click();

    await play();
  }

  const play = async () => {
    let image = document.querySelector("div.image");
    while (!image) {
      await sleep(1);
      image = document.querySelector("div.image");
    }

    const handleCheatLimit = async () => {
      try {
        const currentScore = parseInt(document.querySelector(".score > b").textContent);
        const scoreLeft = target - currentScore;
        console.log("To target: ", scoreLeft);
        if (currentScore + MAX_POSSIBLE_SCORE > target) {
          const timeToTarget = (MAX_POSSIBLE_SCORE - scoreLeft) * TIME_PER_SCORE;
          console.log("Sleeping for target:", timeToTarget)
          await sleep(timeToTarget);
        }
      } catch {}
    }

    const handleMutation = async () => {
      await handleCheatLimit();
      const imageSize = await getImageSize(image);
      await clickAnswer(imageSize);
      await handleFinish();
    }

    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach(handleMutation);
    });
    imageObserver.observe(image, { attributes : true, attributeFilter : ['style'] });
    await handleMutation();
  }

  const getImageSize = async (image) => {
    const imageEndpoint = image.style.backgroundImage.slice(5, -2); // Removes url(" and ")
    const imageUrl = "https://polyconseil.ilucca.net" + imageEndpoint;
    let entry = performance.getEntriesByName(imageUrl)[0];
    while (!entry) {
      await sleep(1);
      entry = performance.getEntriesByName(imageUrl)[0];
    }
    return entry.transferSize;
  }

  const clickAnswer = async (size) => {
    const answer = answers[size];

    let answersButtons = document.querySelectorAll("button.answer");
    while (answersButtons.length === 0) {
      await sleep(1);
      answersButtons = document.querySelectorAll("button.answer");
    }

    if (!answer) {
      answersButtons[0].click();

      await sleep(500);
      const rightAnswerButton = document.querySelector("button.is-right");
      const rightAnswer = rightAnswerButton.textContent;
      console.log("You discovered a new person!", rightAnswer);

      answers[size] = rightAnswer;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } else {
      const answerButton = answersButtons.forEach((button) => {
        if (button.textContent === answer) {
          button.click();
        }
      });
    }
  }

  try {
    await addBotButton();
  } catch {}
  try {
    await startGame();
  } catch {}
})();
