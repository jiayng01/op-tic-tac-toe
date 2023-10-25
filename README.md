# op-tic-tac-toe

## minmax

The largest value the player can be sure to get when they know the actions of the other players.

- For each possible action of the opponent, filter the actions that give the maximum payoff for themselves.
  - In the game tree: return the most positive value when it is bot's turn
- From the actions that give the maximum payoffs, take the action that gives the minimum payoff.
  - In the game tree: return the most negative value when it is opponent's turn
