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
~~- fix: if first move changed, move to branch~~<br>
~~- add icons to the imported moves~~<br>
~~- flip board feature~~<br>
~~- bug: when on mainline branch icons on sidebar don't show~~<br>
~~- changed sidebar styling for classifications text~~<br>
~~- add loading bar while its generating the analysis array~~<br>
~~- list of move classifications for each player on report tab~~<br>
~~- make it so that hanging mate is a blunder (if Mate in less than 5 and the opponent wasn't getting mated before)~~<br>
~~- evaluation graph~~<br>
~~- for best moves make it be able to expand~~<br>
~~- when hovering over the graph show the value, move, and classification~~<br>
~~- make the current dot/line the corresponding color of the move~~<br>
~~- make the move buttons on the bottom of sidebar and appear for both report and analysis tabs~~<br>
~~- make the graph y max change based on the highest change in evaluation~~<br>
~~- make the graph clickable~~<br>
~~- make the dots the corresponding color on graph~~<br>
~~- add book~~<br>
~~- organize the files in the frontend/src folder~~<br>
~~- add number of book moves to report~~<br>
~~- add openings name~~<br>
~~- lock board movement when importing~~<br>
~~- bug: when user moves in new game it uses old opening name~~<br>
~~- bug: hover dot on graph stays on~~<br>
~~- add engine depth toggle~~<br>

- make waiting bar for moves extend
- add a notification for errors
- have storage of the state on user refresh
- make the best moves clickable
- add accuracy rating for each player and elo
- change calculations based on settings

### classifications

- add great
- add miss
