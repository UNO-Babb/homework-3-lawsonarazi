from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Global variables to store game state
players = ["Player 1", "Player 2", "Player 3", "Player 4"]
current_player = 0
player_wins = [0, 0, 0, 0]
level = "Easy"
impassable_squares = []
game_grid = []
player_position = {player: 0 for player in players}

# Function to generate the game grid
def generate_grid(level):
    grid = [[0] * 10 for _ in range(10)]  # Create a 10x10 grid of 0s (passable squares)
    
    # Number of impassable squares
    if level == "Easy":
        num_impassable = 15
    elif level == "Medium":
        num_impassable = 30
    elif level == "Hard":
        num_impassable = 50
    else:  # Expert
        num_impassable = 75
    
    # Randomly assign impassable squares
    impassable_positions = set()
    while len(impassable_positions) < num_impassable:
        row = random.randint(0, 9)
        col = random.randint(0, 9)
        impassable_positions.add((row, col))
    
    for row, col in impassable_positions:
        grid[row][col] = -1  # -1 represents an impassable square
    
    # Ensure there's a valid path from top to bottom row
    while not has_valid_path(grid):
        grid = generate_grid(level)
    
    return grid, impassable_positions

# Function to check if there is a valid path from the top row to the bottom row
def has_valid_path(grid):
    visited = [[False] * 10 for _ in range(10)]
    
    def dfs(row, col):
        if row < 0 or row >= 10 or col < 0 or col >= 10 or visited[row][col] or grid[row][col] == -1:
            return False
        if row == 9:  # Reached the bottom row
            return True
        visited[row][col] = True
        # Explore in all 4 directions
        return (dfs(row + 1, col) or dfs(row - 1, col) or dfs(row, col + 1) or dfs(row, col - 1))
    
    for col in range(10):  # Start DFS from any cell in the top row
        if grid[0][col] != -1 and dfs(0, col):
            return True
    return False

# Function to check if the player has reached the last row
def has_won(player_position):
    return player_position >= 90  # Reached the last row

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_players', methods=['POST'])
def set_players():
    global level
    num_players = int(request.form['num_players'])
    level = request.form['level']
    global game_grid, impassable_squares
    game_grid, impassable_squares = generate_grid(level)
    return jsonify(success=True)

@app.route('/next_player', methods=['POST'])
def next_player():
    global current_player
    current_player = (current_player + 1) % 4
    return jsonify(current_player=current_player)

@app.route('/make_move', methods=['POST'])
def make_move():
    global player_position, current_player, game_grid, impassable_squares
    player = players[current_player]
    square_id = int(request.form['square_id'])
    
    row, col = divmod(square_id, 10)
    
    if game_grid[row][col] == -1:  # If it's an impassable square
        return jsonify(game_over=True)
    
    # Update player position if the square is passable
    player_position[player] = square_id
    
    if has_won(player_position[player]):
        player_wins[current_player] += 1
        return jsonify(game_won=True, winner=player)
    
    return jsonify(game_over=False, player_position=player_position[player])

@app.route('/restart_game', methods=['POST'])
def restart_game():
    global game_grid, impassable_squares, player_position, current_player
    game_grid, impassable_squares = generate_grid(level)
    player_position = {player: 0 for player in players}
    current_player = 0
    return jsonify(game_restart=True)

@app.route('/get_game_state', methods=['GET'])
def get_game_state():
    return jsonify(game_grid=game_grid, player_position=player_position, 
                   current_player=current_player, player_wins=player_wins)

if __name__ == '__main__':
    app.run(debug=True)
