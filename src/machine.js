import { createMachine, assign } from 'xstate';

// array of card images
const cardImages = [
  "/img/helmet-1.png",
  "/img/potion-1.png",
  "/img/ring-1.png",
  "/img/scroll-1.png",
  "/img/shield-1.png",
  "/img/sword-1.png"
];

const shuffleCards = () => {
  const cards = [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5) // shuffled array
    .map((card, index) => ({ src: card, id: index, matched: false }));
  return cards;
}

const isValidMove = (ctx, event) => {
  return ctx.cards[event.id].matched === false;
};

const matches = (ctx, event) => {
  if (ctx.choiceOne !== null && ctx.choiceTwo !== null) {
    console.log(ctx.cards[ctx.choiceOne].src === ctx.cards[ctx.choiceTwo].src);
    return ctx.cards[ctx.choiceOne].src === ctx.cards[ctx.choiceTwo].src;
  }
};

const flippedAllCards = (ctx, event) => {
  return ctx.cards.every((card) => card.matched);
};

const memoryMachine = createMachine({
  id: 'memoryGame',
  initial: 'onGame',
  context: {
    turnCounter: 0,
    cards: shuffleCards()
  },
  on: {
    newGame: {
      actions: ['newGame'],
      target: 'onGame'
    }
  },
  states: {
    onGame: {
      on: {
        "": [
          { target: 'onFinish', cond: 'flippedAllCards' },
        ],
        ON_CLICK: [
          {
            cond: 'isValidMove',
            actions: 'setChoiceOne',
            target: 'flip'
          }
        ]
      },
    },
    onFinish: {
    },
    flip: {
      on: {
        ON_CLICK: [
          {
            cond: 'isValidMove',
            actions: 'setChoiceTwo',
            target: 'matching'
          }
        ]
      },
    },
    matching: {
      after: {
        50: { target: 'onGame', cond: 'matches' },
        1000: { target: 'onGame' }
      },
      exit: [
        'updateChoices'
      ]
    }
  }
},
  {
    guards: {
      isValidMove,
      matches,
      flippedAllCards
    },
    actions: {
      updateChoices: assign({
        cards: (ctx, event) => {
          const updatedCards = [...ctx.cards];
          if (ctx.cards[ctx.choiceOne].src === ctx.cards[ctx.choiceTwo].src) {
            updatedCards[ctx.choiceOne].matched = true;
            updatedCards[ctx.choiceTwo].matched = true;
          }

          return updatedCards;
        },
        choiceOne: (ctx, event) => null,
        choiceTwo: (ctx, event) => null
      }),
      setChoiceOne: assign({
        choiceOne: (ctx, event) => event.id,
      }),
      setChoiceTwo: assign({
        choiceTwo: (ctx, event) => event.id,
      }),
      newGame: assign({
        turnCounter: () => null,
        cards: shuffleCards,
        choiceOne: () => null,
        choiceTwo: () => null,
      })
    }
  });

export { memoryMachine };
