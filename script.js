const requestURL ="https://api.balldontlie.io/v1/xxxxxxxx";
    
const options = {
    headers: {
        Authorization: "e79503ab-9420-4985-a6d0-3b624ec668ce"
    }
};

async function createList(){
    const players = []; // Array to store player data
    const playerRankingsElement = document.getElementById('playerRankings');

    // Clear previous content
    playerRankingsElement.innerHTML = 'Compiling The INFORMATION PLEASE WAIT!';
        // Assuming you have a list of player names, you can loop through them
        const playerNames = []; // Add more player names as needed
        try {
            const response = await fetch(`https://api.sportsdata.io/v3/nba/scores/json/PlayersActiveBasic?key=77a7366503e941389882191b0c894c3e`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            var teamAbbreviation = document.getElementById("nbaTeams").value;
            const data = await response.json();
            const playersFromTeam = data.filter(player => player.Team === teamAbbreviation);

            playersFromTeam.forEach(player => {
                const fullName = `${player.FirstName} ${player.LastName}`;
                playerNames.push(fullName);
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const playerName of playerNames) {
            try {
                const response = await fetch(`https://api.balldontlie.io/v1/players?search=${playerName}`, {
                    headers: {
                      'Authorization': apiKey
                      // Other headers if required by the API
                    }
                  });
                const data = await response.json();
                var player = data.data[0];
                var playerID = player.id;

                const playerStats = await getPlayerStats(playerID);
                const averageStats = await displayStats(playerID);
                const percentage = (((playerStats.averageAssists / averageStats.overallAssists) + (playerStats.averagePoints / averageStats.overallPoints) + (playerStats.averageRebounds / averageStats.overallRebounds)) / 3) * 100;
    
                // Add player data to the array
                players.push({
                    playerName: playerName,
                    percentage: percentage,
                });
        
                await delay(300);

            } catch (error) {
                console.error('Error fetching player data:', error);
            }
        }
        // Sort players based on percentage in descending order
        players.sort((a, b) => {
            // Check for NaN and move it to the end
            if (isNaN(a.percentage) && isNaN(b.percentage)) {
              return 0;
            } else if (isNaN(a.percentage)) {
              return 1; // Move NaN to the end
            } else if (isNaN(b.percentage)) {
              return -1; // Move NaN to the end
            } else {
              return b.percentage - a.percentage; // Sort descending order
            }
          });        
        // Update the UI with sorted player data
        updatePlayerUI(players);
}

async function showInfo() {
    var playerName = document.getElementById('search-bar').value;
    var playerID = "0";

    try {
        // Searches for player based on the name
        const response = await fetch(`https://api.balldontlie.io/v1/players?search=${playerName}`, {
            headers: {
              'Authorization': apiKey
              // Other headers if required by the API
            }
          });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        var userInfo = document.getElementById("playerInfo");
        var extraSpace = document.getElementById("extraSpace");

        if (data.data.length > 0) {
            var player = data.data[0];
            playerID = player.id;

            // Use await to wait for the promises to resolve
            const playerStats = await getPlayerStats(playerID);
            const averageStats = await displayStats(playerID);
            nbaImageChange(player.first_name, player.last_name);

            var recentInfo = document.getElementById("recentInfo");
            recentInfo.innerHTML = `
                <strong>Avg Mins Past 5 Games:</strong> ${playerStats.averageMin} <br>
                <strong>Avg Pts Past 5 Games:</strong> ${playerStats.averagePoints} <br>
                <strong>Avg Rebounds Past 5 Games:</strong> ${playerStats.averageRebounds} <br>
                <strong>Avg Assists Past 5 Games:</strong> ${playerStats.averageAssists} <br>
                <strong>Avg Threes Past 5 Games:</strong> ${playerStats.averageThrees} <br>
            `;

            var statInfo = document.getElementById("statInfo");
            statInfo.innerHTML = `
                <strong>Games Played:</strong> ${averageStats.games} <br>
                <strong>Average Minutes In Game:</strong> ${averageStats.overallMin} <br>
                <strong>Points per Game:</strong> ${averageStats.overallPoints} <br>
                <strong>Rebounds per Game:</strong> ${averageStats.overallRebounds} <br>
                <strong>Assists per Game:</strong> ${averageStats.overallAssists} <br>
                <strong>Field Goal Percentage:</strong> ${averageStats.fgPCT} <br>
                <strong>Three-Point Percentage:</strong> ${averageStats.fg3PCT} <br>
                <strong>Free Throw Percentage:</strong> ${averageStats.ftPCT} <br>
            `;

            const percentage = (((playerStats.averageAssists/averageStats.overallAssists) + (playerStats.averagePoints/averageStats.overallPoints)+ (playerStats.averageRebounds/averageStats.overallRebounds))/3)*100;
            if(percentage > 125){
                extraSpace.innerHTML = `
                BET ON HIS ASS BRO PERFORMING ${percentage.toFixed(2)}% BETTER TO THE FUCKIN MOOOOOOOOOOOOOON.
            `;
            } else if(percentage > 100){
                extraSpace.innerHTML = `
               HE DOING OK, PERFORMING ${percentage.toFixed(2)}% BETTER THAN NORMAL.
            `;
            } else if(percentage > 80){
                extraSpace.innerHTML = `HE DOING EHHHHHHHHHHHHHHHH PERFORMING ${percentage.toFixed(2)}% WORSE THAN NORMAL.`;
            } else {
                extraSpace.innerHTML = `THIS GUY IS A FUCKING DROOOOOOOOOOOOOOLER PERFORMING ${percentage.toFixed(2)}% WORSE. BET UNDER BET UNDER BET UNDER.`;
            }

            // Display specific information in the user interface
            userInfo.innerHTML = `
                <strong>Player ID:</strong> ${player.id} <br>
                <strong>Player Name:</strong> ${player.first_name} ${player.last_name} <br>
                <strong>Height:</strong> ${player.height_feet}'${player.height_inches}" <br>
                <strong>Position:</strong> ${player.position} <br>
                <strong>Team:</strong> ${player.team.full_name} <br>
            `;
        } else {
            userInfo.textContent = 'No player found.';
        }

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function updatePlayerUI(players) {
    // Assuming you have an HTML element to display the player rankings
    const playerRankingsElement = document.getElementById('playerRankings');

    // Clear previous content
    playerRankingsElement.innerHTML = '';

    // Display players in the sorted order
    players.forEach((player, index) => {
        const listItem = document.createElement('li');
        if(isNaN(player.percentage)){
            listItem.textContent = `${index + 1}. ${player.playerName} - This guy injured or drooling.`;
        } else {
            listItem.textContent = `${index + 1}. ${player.playerName} - ${player.percentage.toFixed(2)}%`;
        }
        playerRankingsElement.appendChild(listItem);
    });
}

async function getPlayerStats(playerID) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://api.balldontlie.io/v1/season_averages?seasons[]=2023&player_ids[]=${playerID}`, {
                headers: {
                  'Authorization': apiKey
                  // Other headers if required by the API
                }
              });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const recentGames = data.data.slice(-5).filter(game =>
                parseInt(game.min, 10) !== 0 
            );

            const totalPoints = recentGames.reduce((sum, game) => sum + game.pts, 0);
            const averagePoints = totalPoints / recentGames.length;
            const totalRebounds = recentGames.reduce((sum, game) => sum + game.reb, 0);
            const averageRebounds = totalRebounds / recentGames.length;
            const totalAssists = recentGames.reduce((sum, game) => sum + game.ast, 0);
            const averageAssists = totalAssists / recentGames.length;
            const totalMin = recentGames.reduce((sum, game) => sum + parseInt(game.min, 10), 0);
            const averageMin = totalMin / recentGames.length;
            const totalThrees = recentGames.reduce((sum, game) => sum + game.fg3m, 0);
            const averageThrees = totalThrees / recentGames.length;

            const averagesObject = {
                averageMin,
                averagePoints,
                averageRebounds,
                averageAssists,
                averageThrees,
            };

            resolve(averagesObject);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }
    });
}

async function displayStats(playerID) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://api.balldontlie.io/v1/season_averages?seasons[]=2023&player_ids[]=${playerID}`, {
                headers: {
                  'Authorization': apiKey
                  // Other headers if required by the API
                }
              });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            var statInfo = document.getElementById("statInfo");
            var player = data.data[0];

            const totalAverage = {
                overallMin: player.min,
                overallPoints: player.pts,
                overallRebounds: player.reb,
                overallAssists: player.ast,
                fgPCT: player.fg_pct,
                fg3PCT: player.fg3_pct,
                ftPCT: player.ft_pct,
                games: player.games_played,
            };

            resolve(totalAverage);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }
    });
}

async function nbaImageChange(firstName, lastName) {
    return new Promise(async (resolve, reject) => {
        var playerID = "null";
        try {
            const response = await fetch(`https://api.sportsdata.io/v3/nba/scores/json/PlayersActiveBasic?key=77a7366503e941389882191b0c894c3e`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            const matchingPlayers = data.filter(player =>
                player.FirstName.toLowerCase() === firstName.toLowerCase() &&
                player.LastName.toLowerCase() === lastName.toLowerCase()
            );
            playerID = matchingPlayers.length > 0 ? matchingPlayers[0].PlayerID : "null";

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }

        try {
            const response = await fetch(`https://api.sportsdata.io/v3/nba/scores/json/Player/${playerID}?key=77a7366503e941389882191b0c894c3e`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const nbaID = data.NbaDotComPlayerID;
            var imgElement = document.getElementById('dynamicImage');
            imgElement.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${nbaID}.png`
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }
    });
}

async function getNBAId(firstName, lastName){
    return new Promise(async (resolve, reject) => {
        var playerID = "null";
        try {
            const response = await fetch(`https://api.sportsdata.io/v3/nba/scores/json/PlayersActiveBasic?key=77a7366503e941389882191b0c894c3e`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            const matchingPlayers = data.filter(player =>
                player.FirstName.toLowerCase() === firstName.toLowerCase() &&
                player.LastName.toLowerCase() === lastName.toLowerCase()
            );
            playerID = matchingPlayers.length > 0 ? matchingPlayers[0].PlayerID : "null";

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }

        try {
            const response = await fetch(`https://api.sportsdata.io/v3/nba/scores/json/Player/${playerID}?key=77a7366503e941389882191b0c894c3e`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const nbaID = data.NbaDotComPlayerID;
            const newWindow = window.open(`https://www.nba.com/stats/player/${nbaID}/boxscores-traditional?LastNGames=15&Period=1`);
            if (newWindow) {
                // New window opened successfully
                newWindow.focus();
            } else {
                // Browser blocked the new window
                userInfo.textContent = 'Pop-up blocked. Please enable pop-ups and try again.';
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            reject(error);
        }
    });
}

var button = document.getElementById("nbaStatButton");

button.addEventListener("click", async function () {
    var playerName = document.getElementById('search-bar').value;

    try {
        // Searches for player based on the name
        const response = await fetch(`https://api.balldontlie.io/v1/players?search=${playerName}`, {
            headers: {
              'Authorization': apiKey
              // Other headers if required by the API
            }
          });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        var userInfo = document.getElementById("playerInfo");

        if (data.data.length > 0) {
            var player = data.data[0];
            (async () => {
                await getNBAId(player.first_name, player.last_name);
            })();
        } else {
            userInfo.textContent = 'No player found.';
        }

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
});