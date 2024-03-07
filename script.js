document.getElementById("resetBtn").addEventListener("click", function() {
    location.reload();
});


document.addEventListener("DOMContentLoaded", function() {
    const playerGrid = document.querySelector(".player-grid");
    const computerGrid = document.querySelector(".computer-grid");
    const ships = document.querySelectorAll(".ship");
    const startGameBtn = document.getElementById("startGameBtn");
    startGameBtn.disabled = true;
    let computerLayout = null; // Store computer's secret layout
    let draggingShip = null;
    let rotateKeyPressed = false; // Track if 'r' key is pressed
    let placedShips = 0;
    let playerHits = 0; // Track player hits
    let computerHits = 0; // Track computer hits
    let playerTurn = true; // Flag to track player's turn
    var playerLayoutArray = [];
    const missedInfoTextarea = document.getElementById("missedInfo");
    missedInfoTextarea.value="Place all your ships to be able to start the game!\n";
    for (let i = 0; i < 10; i++) {
        playerLayoutArray.push(new Array(10).fill(false)); // Initialize all cells as false (empty)
    }
    const session = pl.create();

    // Generate grid cells for player and computer grids
    generateGridCells(playerGrid);
    generateGridCells(computerGrid);

    // Add event listeners to ships for drag and drop
    ships.forEach(ship => {
        ship.addEventListener("dragstart", dragStart);
        ship.addEventListener("dragend", dragEnd);
    });

    // Add event listener to player grid for drop
    playerGrid.addEventListener("dragover", dragOver);
    playerGrid.addEventListener("dragenter", dragEnter);
    playerGrid.addEventListener("dragleave", dragLeave);
    playerGrid.addEventListener("drop", drop);

    // Function to generate grid cells
    function generateGridCells(grid) {
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            // Add unique identifiers to each cell
            cell.id = grid === playerGrid ? "p" + i : "c" + i;
            grid.appendChild(cell);
        }
    }

    // Drag start event handler
    function dragStart(event) {
        // Add a custom data attribute to store the ship ID
        event.dataTransfer.setData("shipId", event.target.id);
        draggingShip = event.target;
    }

    // Drag end event handler
    function dragEnd(event) {
        // Reset any styles or attributes if needed
        draggingShip = null;
    }

    // Drag over event handler
    function dragOver(event) {
        event.preventDefault(); // Allow drop
    }

    // Drag enter event handler
    function dragEnter(event) {
        event.preventDefault(); // Allow drop
    }

    // Drag leave event handler
    function dragLeave(event) {
        // Reset cell styles or attributes if needed
    }

    // Drop event handler
    function drop(event) {
        event.preventDefault();
        const shipId = event.dataTransfer.getData("shipId");
        const ship = document.getElementById(shipId);
        const cell = event.target;

        // Check if drop position is valid for placing the ship
        if (isValidPlacement(cell, ship)) {
            placedShips+=1;
            // Color the cells to indicate placement
            const shipSize = parseInt(ship.getAttribute("data-size"));
            const cellsToColor = getCellsToColor(cell, shipSize, ship);
            cellsToColor.forEach(cell => {
                cell.style.backgroundColor = "gray";
            });

            // Update player's layout array
            const playerLayout = updatePlayerLayoutArray(cellsToColor);

            // Hide the placed ship
            ship.style.display = "none";

            // Enable start game button if all ships are placed
            if (placedShips === 10) {
                startGameBtn.disabled = false;
                console.log("enabled button");
                console.log("Player's Secret Layout:");
                console.log("-------------------------");
                for (const row of playerLayout) {
                    console.log(row.map(cell => cell ? 'X' : '.').join(' '));
                }
            }
        }
    }

// Function to update player's layout array
    function updatePlayerLayoutArray(cellsToColor) {
        cellsToColor.forEach(cell => {
            const cellIndex = parseInt(cell.id.substring(1)); // Get the index of the cell
            playerLayoutArray[cellIndex / 10 >> 0][cellIndex % 10] = true; // Set the cell as true (occupied by ship)
        });
        return playerLayoutArray;
    }

// Function to check if drop position is valid for placing the ship
    function isValidPlacement(cell, ship) {
        const shipSize = parseInt(ship.getAttribute("data-size"));
        const startCellId = cell.id;
        const startCellIndex = parseInt(startCellId.substring(1));
        const isHorizontal = ship.getAttribute('data-rotation') === 'horizontal';
        let currentIndex = startCellIndex;

        // Check if ship goes out of bounds
        if (isHorizontal && currentIndex % 10 + shipSize > 10) {
            return false;
        } else if (!isHorizontal && currentIndex + (shipSize - 1) * 10 >= 100) {
            return false;
        }

        // Check if any cells are already occupied or adjacent to other ships
        for (let i = 0; i < shipSize; i++) {
            const currentCell = document.getElementById("p" + currentIndex);
            if (!currentCell || currentCell.style.backgroundColor === "gray") {
                return false;
            }
            // Check surrounding cells for adjacent ships
            const surroundingCells = getSurroundingCells(currentCell);
            for (const surroundingCell of surroundingCells) {
                if (surroundingCell.style.backgroundColor === "gray") {
                    return false;
                }
            }
            currentIndex = isHorizontal ? currentIndex + 1 : currentIndex + 10;
        }

        return true;
    }

    function getSurroundingCells(cell) {
        const cellId = cell.id;
        const cellIndex = parseInt(cellId.substring(1));
        const surroundingCellIndices = [
            cellIndex - 11, cellIndex - 10, cellIndex - 9, // Top-left, top, top-right
            cellIndex - 1, cellIndex + 1, // Left, right
            cellIndex + 9, cellIndex + 10, cellIndex + 11 // Bottom-left, bottom, bottom-right
        ];
        const surroundingCells = [];
        for (const index of surroundingCellIndices) {
            const surroundingCell = document.getElementById("p" + index);
            if (surroundingCell) {
                surroundingCells.push(surroundingCell);
            }
        }
        return surroundingCells;
    }

    // Function to get cells to color based on drop position and ship size
    function getCellsToColor(startCell, shipSize, ship) {
        const cellsToColor = [];
        const startCellId = startCell.id;
        const startCellIndex = parseInt(startCellId.substring(1));
        const isHorizontal = ship.getAttribute('data-rotation') === 'horizontal'; // Check ship's rotation state
        let currentIndex = startCellIndex;

        // Add the start cell
        cellsToColor.push(startCell);

        // Add cells horizontally or vertically based on ship's rotation
        for (let i = 1; i < shipSize; i++) {
            currentIndex = isHorizontal ? currentIndex + 1 : currentIndex + 10;
            const cell = document.getElementById("p" + currentIndex);
            if (cell) cellsToColor.push(cell);
        }

        return cellsToColor;
    }



    ///////////////////////////////////////////////////////////////////////
    function generateComputerLayout() {
        const layout = [];
        // Initialize the layout grid with False values
        for (let i = 0; i < 10; i++) {
            layout.push(new Array(10).fill(false));
        }

        // Define ship sizes
        const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

        // Randomly place each ship on the grid
        for (const size of shipSizes) {
            let isValidPlacement = false;
            while (!isValidPlacement) {
                const randomRow = Math.floor(Math.random() * 10);
                const randomCol = Math.floor(Math.random() * 10);
                const isHorizontal = Math.random() < 0.5;

                // Check if the ship can be placed at the random position
                if (isHorizontal && randomCol + size <= 10) {
                    isValidPlacement = true;
                    for (let j = randomCol; j < randomCol + size; j++) {
                        if (layout[randomRow][j] || hasAdjacentShip(layout, randomRow, j)) {
                            isValidPlacement = false;
                            break;
                        }
                    }
                    if (isValidPlacement) {
                        for (let j = randomCol; j < randomCol + size; j++) {
                            layout[randomRow][j] = true;
                        }
                    }
                } else if (!isHorizontal && randomRow + size <= 10) {
                    isValidPlacement = true;
                    for (let j = randomRow; j < randomRow + size; j++) {
                        if (layout[j][randomCol] || hasAdjacentShip(layout, j, randomCol)) {
                            isValidPlacement = false;
                            break;
                        }
                    }
                    if (isValidPlacement) {
                        for (let j = randomRow; j < randomRow + size; j++) {
                            layout[j][randomCol] = true;
                        }
                    }
                }
            }
        }

        return layout;
    }
    function hasAdjacentShip(layout, row, col) {
        const adjacentOffsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [offsetRow, offsetCol] of adjacentOffsets) {
            const newRow = row + offsetRow;
            const newCol = col + offsetCol;
            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10 && layout[newRow][newCol]) {
                return true;
            }
        }

        return false;
    }

    computerLayout=generateComputerLayout();
    console.log("Computer's Secret Layout:");
    console.log("-------------------------");
    for (const row of computerLayout) {
        console.log(row.map(cell => cell ? 'X' : '.').join(' '));
    }

    startGameBtn.addEventListener("click", startGame);
    /////////////////////////////////////////////////////////////////////////

    async function plquery(query) {
        return new Promise((resolve, reject) => {
            session.consult("logic.pl", {
                success: function() {
                    // Once the program is loaded, query it
                    session.query(query, {
                        success: function(goal) {
                            // Find answers
                            let ans = null;
                            session.answers(async x => {
                                ans = pl.format_answer(x);
                                resolve(ans); // Resolve the promise with the answer
                            }, 1);
                        },
                        error: function(err) {
                            console.error(err);
                            reject(err); // Reject the promise on error
                        }
                    });
                },
                error: function(err) {
                    console.error(err);
                    reject(err); // Reject the promise on error
                }
            });
        });
    }



    async function startGame() {
        missedInfoTextarea.value+="Game started! Player's turn!\n";
        startGameBtn.disabled = false;
        const session = pl.create();

        // Convert playerLayoutArray to Prolog format and assert it into Prolog session
        for (let i = 0; i < playerLayoutArray.length; i++) {
            for (let j = 0; j < playerLayoutArray[i].length; j++) {
                if (playerLayoutArray[i][j]===true) {
                    let result = await plquery(`asserta(player_ship("Player", "p${i * 10 + j}")).`);
                }
            }
        }

        // Convert computerLayout to Prolog format and assert it into Prolog session
        for (let i = 0; i < computerLayout.length; i++) {
            for (let j = 0; j < computerLayout[i].length; j++) {
                if (computerLayout[i][j]===true) {
                    let result = await plquery(`asserta(computer_ship("Computer", "c${i * 10 + j}")).`);
                }
            }
        }
        computerGrid.addEventListener("click", handlePlayerClick);

        async function handlePlayerClick(event) {
            if (!playerTurn) return; // If it's not player's turn, do nothing
            const cell = event.target;
            if (!cell.classList.contains("cell")) return; // If the clicked element is not a cell, do nothing
            const cellId = cell.id;

            let result = await plquery(`computer_ship("Computer", "${cellId}").`);

            function displayCongratulationsBanner() {
                const banner = document.createElement("div");
                banner.textContent = "Congratulations! You won!";
                banner.classList.add("congratulations-banner");
                document.body.appendChild(banner);
            }

            if (result==="true") {
                cell.style.backgroundColor = "red"; // Color the cell red for a hit
                playerHits++;
                if (playerHits === 20) {
                    missedInfoTextarea.value += "Player wins!\n";
                    console.log("Player wins!");
                    displayCongratulationsBanner();
                    endGame();
                } else {
                    console.log("Player hit! Click again.");
                }
            } else {
                missedInfoTextarea.value += "Player missed! Computer's turn.\n";
                console.log("Player missed! Computer's turn.");
                cell.style.backgroundColor = "blue"; // Color the cell blue for a miss
                playerTurn = false; // Switch to computer's turn
                computerTurn();
            }
        }

        function computerTurn() {
            setTimeout(async () => {
                try {
                    var result = await plquery("computer_turn(X).");
                    result=result.slice(4);  //X = p48
                    if (result) {
                        const cellId = result;
                        const cell = document.getElementById(cellId);
                        const hitResult = await plquery(`player_ship("Player", "${cellId}").`);
                        if (hitResult==="true") {
                            cell.style.backgroundColor = "red"; // Color the cell red for a hit
                            computerHits++;
                            if (computerHits === 20) {
                                missedInfoTextarea.value += "Computer wins!\n";
                                console.log("Computer wins!");
                                endGame();
                            } else {
                                missedInfoTextarea.value += "Computer hit! Computer's turn.\n";
                                console.log("Computer hit! Computer's turn.");
                                computerTurn() // Switch to player's turn
                            }
                        } else {
                            cell.style.backgroundColor = "blue"; // Color the cell blue for a miss
                            missedInfoTextarea.value += "Computer missed! Player's turn.\n";
                            console.log("Computer missed! Player's turn.");
                            playerTurn = true; // Switch to player's turn
                        }
                    }else{

                    }
                } catch (error) {
                    console.error(error);
                }
            }, 1000); // Delay computer's turn by 1 second for better visualization
        }



        function endGame() {
            // Disable player clicks on the computer's grid
            computerGrid.removeEventListener("click", handlePlayerClick);
        }
    }


});
