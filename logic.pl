:- use_module(library(random)).

% Define predicate to check if a cell contains a ship for the player
:- dynamic(computer_ship/2).
:- dynamic(player_ship/2).

ship_at("Player", Cell) :-
    player_ship("Player", Cell),
    !.

% Define predicate to check if a cell contains a ship for the computer
ship_at("Computer", Cell) :-
    computer_ship("Computer", Cell),
    !.

% Define predicate to determine if a cell is a hit
hit(Player, Cell) :-
    ship_at(Player, Cell),
    !.

% Define the computer_turn predicate
computer_turn(Result) :-
    random(0, 100, RandomNum),
    number_chars(RandomNum, RandomChars),
    atom_chars(RandomAtom, RandomChars),
    atom_concat('p', RandomAtom, Result).
