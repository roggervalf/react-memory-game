import { createMachine, assign } from "xstate";

const restartCards = (cardImages) => {
  return [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map((card) => ({ ...card, id: Math.random() }));
};

const resetTurn = (ctx) => {
  ctx.choiceOne = null;
  ctx.choiceTwo = null;
  ctx.turnCounter = ctx.turnCounter + 1;
  ctx.boardDisabled = false;
};

const cardImages = [
  { src: "/img/helmet-1.png", matched: false },
  { src: "/img/potion-1.png", matched: false },
  { src: "/img/ring-1.png", matched: false },
  { src: "/img/scroll-1.png", matched: false },
  { src: "/img/shield-1.png", matched: false },
  { src: "/img/sword-1.png", matched: false },
];

const memoryMachine = createMachine(
  {
    id: "memoryGame",
    initial: "onGame",
    context: {
      turnCounter: 0,
      sourceCard: restartCards(cardImages),
      choiceOne: null,
      choiceTwo: null,
      disableBoard: null,
    },
    on: {
      newGame: {
        actions: ["newGame"],
        target: "onGame",
      },
    },
    states: {
      onGame: {
        on: {
          ONCLICK: [
            {
              cond: "choiceOne",
              target: "flip",
            },
            {
              target: "onGame",
            },
          ],
        },
        // exit: 'updateBoard'
      },
      flip: {
        on: {
          ONCLICK: [
            {
              cond: "flippedAllCards",
              target: "onFinish",
            },
            {
              target: "onGame",
              cond: "choiceTwo",
            },
          ],
        },
        exit: ["updateMatch"],
      },
      onFinish: {},
    },
  },
  {
    guards: {
      evaluateMatch: (ctx) => {
        return true;
      },
      choiceOne: (ctx, evt) => {
        ctx.choiceOne = evt.value;
        return true;
      },
      choiceTwo: (ctx, evt) => {
        ctx.choiceTwo = evt.value;
        return true;
      },
      flippedAllCards: (ctx, evt) => {},
    },
    actions: {
      updateMatch: (ctx, evt) => {
        if (ctx.choiceOne && ctx.choiceTwo) {
          ctx.disableBoard = true;
          if (ctx.choiceOne.src === ctx.choiceTwo.src) {
            console.log(ctx);
            return ctx.sourceCard.map((card) => {
              if (card.src === ctx.choiceOne.src) {
                return { ...card, matched: true };
              } else {
                return card;
              }
            });
          }
          resetTurn(ctx);
        } else {
          setTimeout(() => {
            resetTurn(ctx);
          }, 1000);
        }
      },
      newGame: assign({
        turnCounter: (ctx, evt) => 0,
        sourceCard: () => restartCards(cardImages),
        card: () => {},
      }),
    },
  }
);

export { memoryMachine };
