~~- divide the analysis by 100 for each item~~ <br>
~~- bug: backend fails if one in chunk is null~~ <br>
~~- fix: when its already mate, make it return M0 or -M0.~~ <br>
~~- fix: skip pgn import if its empty~~ <br>
~~- add sound effects: move, take, can't move there, game over, check, promotion~~<br>
~~-fix: on the evaluation for the analysis, put in terms of white~~ <br>
~~- make a bar to show the evaluation~~<br>
~~- add checkmate sound effect~~ <br>
~~- prevent user from clicking the import button if its running~~ <br>
~~- analyze + evaluate user moves when on branch~~ <br>
~~- prevent from flickering 0.00 on eval bar when moving~~ <br>
~~- make it so it evaluates and analyzes on user move (make new evaluate function for just 1 fen)~~ <br>
~~- add sound effects to user move~~ <br>
~~- be able to display the user move history on sidebar~~<br>
~~- make clicking a mainline move go to that move~~<br>
~~- highlight the current move~~ <br>
~~- add types to types.ts~~ <br>
~~- have a visual display of the branches~~ <br>
~~- make the back arrow work on a branch~~ <br>
~~- add number for move to the branches~~<br>
~~- show evaluation and analysis for branch moves~~<br>
~~- use docker container to run~~ <br>
~~- bug: saves previous branches on imports (on importPgn() clear branches arr)~~<br>
~~- better styling for the analysis~~ <br>
~~- clear data on back arrow~~<br>
~~- bring to analyze page once user makes a move~~<br>
~~- when evaluating user move, make the best moves blank to prevent moving sidebar~~<br>
~~- show follow up lines to the moves~~<br>
~~- make arrows different opacity~~<br>
~~- add arrows for the best moves~~<br>
~~- make user arrow orange~~<br>
~~- bug: can't move from branch to mainline~~<br>
~~- add move classifications~~<br>
~~- add classifications for the branch moves~~<br>
~~- fix: best moves not loading when on last move of mainline or when user is first moving~~ <br>
~~- arrows behind by one when making new branch~~ <br>
~~- add icons + colors for the moves~~<br>
~~- change move structure to type with from, to, san~~<br>

- make waiting bar for moves extend
- evaluation graph
- add loading bar while its generating the analysis array
- add a notification for errors
- have storage of the state on user refresh
- flip board feature
- make the best moves clickable
- add accuracy rating for each player and elo

~~- fix: if first move changed, move to branch~~<br>

### classifications

- add book
- add great
- add miss
- add icons to the imported moves
- changed sidebar styling for classifications text
