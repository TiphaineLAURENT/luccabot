(async () => {
  const MAX_POSSIBLE_SCORE = 170;
  const TIME_PER_SCORE = 30;  // ms
  const target = 1549;

  const UI_UPDATE_DELAY = 500;

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
    await sleep(UI_UPDATE_DELAY);
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
    await sleep(UI_UPDATE_DELAY);
    const replayButton = document.querySelector('app-game-state-over button:not([transloco="RANKINGS"])');
    if (!replayButton) {
      return;
    }

    replayButton.addEventListener('click', () => {
      sleep(UI_UPDATE_DELAY).then(startGame);
    });
  }

  const startGame = async () => {
    performance.clearResourceTimings();
    performance.addEventListener("resourcetimingbufferfull", (event) => {
      performance.clearResourceTimings();
    });

    await sleep(UI_UPDATE_DELAY);

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
      for (const [index, button] of answersButtons.entries()) {
        if (Object.values(answers).includes(button.textContent) && index != 3) {
          continue;
        }
        button.click();
      }

      await sleep(UI_UPDATE_DELAY);
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
