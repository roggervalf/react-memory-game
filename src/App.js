import { memoryMachine } from "./machine";
import { inspect } from "@xstate/inspect";
import { useState } from "react";
import { useMachine } from "@xstate/react";
import SingleCard from "./components/SingleCard";
import "./App.css";

inspect({ iframe: false });

const App = () => {
  const [current, send] = useMachine(memoryMachine, { devTools: true });
  const { cards, choiceOne, choiceTwo } = current.context;
  const [turns] = useState(0);
  const [disabled] = useState(false);

  // handle a user choice, update choice one or two
  const handleChoice = (card) => {
    send({ type: 'ON_CLICK', id: card.id });
  };

  return (
    <div className="App">
      <h1>Magic Match</h1>
      <h5>A card memory game</h5>
      <button onClick={() => { }/*shuffleCards*/}>New Game</button>
      <p>Turns: {turns}</p>
      <div className="card-grid">
        {cards.map((card) => (
          <SingleCard
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            cardFlipped={
              card.id === choiceOne || card.id === choiceTwo || card.matched
            }
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
