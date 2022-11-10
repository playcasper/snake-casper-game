    const board_border = 'black';
	const cellSize = 32;
	const cellColor_1 = 'rgb(197, 245, 197)';
	const cellColor_2 = 'rgb(169, 241, 169)';	

	// Load graphics for snake and food
	tileimage = new Image();
	tileimage.src = 'src/snake-graphics.png'
	
	// Define array for snake
	// X offset, Y offset and Direction
    let snake = [ {x: 0, y: 0, d: 'Up'} ]

	// Variables for storing game info
    let score = 0;
    let changing_direction = false;
    let food_x;
    let food_y;
    let dx = cellSize;
    let dy = 0;
    let counter = 3;
	
    // Get the canvas element and dynamically set the height and width
    const snakeboard = document.getElementById("snakeboard");
	snakeboard.height = Math.floor(document.getElementById("game-container").clientHeight / cellSize) * cellSize;
	snakeboard.width = Math.floor(document.getElementById("game-container").clientWidth * 0.5 / cellSize) * cellSize;

    // Return a two dimensional drawing context
    const snakeboard_ctx = snakeboard.getContext("2d");

    // Start game
	reset();
    gen_food();
    clear_board();
    drawFood();
    move_snake();
    drawSnake();
	startTimer();

	// Listen for any key presses
    document.addEventListener("keydown", change_direction);
	
	// Add a listener to close the end of game popup
	const popupClose = document.getElementById("popupClose");
	popupClose.addEventListener("click", () => {
		document.getElementById("popup").style.display = "none";
		document.getElementById("container").classList.remove("blur");
		counter = 3;
		reset();
	    startTimer();
	});
    
	// Reset the game to default values
	function reset() {
		snake = [
		  {x: 96, y: 320, d: 'Right'},
		  {x: 64, y: 320, d: 'Right'},
		  {x: 32, y: 320, d: 'Right'}
		]
		
		score = 0;
		document.getElementById("score").innerHTML = score;

		// True if changing direction
		changing_direction = false;
		dx = cellSize;
		dy = 0;
	}
	
	function startTimer()
	{
	    if(counter === 0)
	    {
    	    document.getElementById("countdown").innerHTML = "";
	        main();
	    }
	    else
	    {
    	    document.getElementById("countdown").innerHTML = counter;
    	    
            setTimeout(function onTick() {
                counter = counter - 1;
                startTimer(); 
            }, 1000)
	    }
	}
	
    // main function called repeatedly to keep the game running
    function main() {
        if (has_game_ended())
		{
			// Blur the background and display end of game popup
			document.getElementById("popup").style.display = "block";
			document.getElementById("container").classList.add("blur");
            document.getElementById("submission_response").innerHTML = "";
            document.getElementById("users_high_score").innerHTML = "";
			
			if(IsCasperSignerInstalled())
			{
    			document.getElementById("saveScoreDiv").style.display = "block";
    			document.getElementById("casperSignerDiv").style.display = "none";
			}
			else
			{
    			document.getElementById("saveScoreDiv").style.display = "none";
    			document.getElementById("casperSignerDiv").style.display = "block";
			}
			return;
		}

        changing_direction = false;
        setTimeout(function onTick() {
            clear_board();
            drawFood();
            move_snake();
            drawSnake();
            main();
        }, 100)
    }
    
    // Setup the canvas border and background
	function clear_board() {
		snakeboard_ctx.strokestyle = board_border;
		snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
	  	  
		snakeboard_ctx.fillStyle = cellColor_1;
		
		offset = 0;
		for(let j = 0; j < snakeboard.height; j += cellSize){
			for (let i = offset; i < snakeboard.width; i += cellSize * 2){
				snakeboard_ctx.fillRect(i, j, cellSize, cellSize);
			}
			if (offset == 0)
				offset = 32;
			else
				offset = 0;
		}
		
		snakeboard_ctx.fillStyle = cellColor_2;
		
		offset = 32;
		for(let j = 0; j < snakeboard.height; j += cellSize){
			for (let i = offset; i < snakeboard.width; i += cellSize * 2){
				snakeboard_ctx.fillRect(i, j, cellSize, cellSize);
			}
			if (offset == 0)
				offset = 32;
			else
				offset = 0;
		}
	}
    
    // Draw the snake on the canvas
    function drawSnake() {
      // Draw each section of the snake
      snake.forEach(drawSnakePart)
    }

    function drawFood() {
	  snakeboard_ctx.drawImage(tileimage, 0*64, 3*64, 64, 64, food_x, food_y, cellSize, cellSize);
    }
    
    // Draw one snake part
	function drawSnakePart(snakePart, index, arr) {
		// Check if snake head
		if (index == 0) {
			// Choose the correct orientation of the snake head
			if (snakePart.d == 'Up') {
				snakeboard_ctx.drawImage(tileimage, 3*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
			}
			else if (snakePart.d == 'Right') {
				snakeboard_ctx.drawImage(tileimage, 4*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
			}
			else if (snakePart.d == 'Down') {
				snakeboard_ctx.drawImage(tileimage, 4*64, 1*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
			}
			else {
				snakeboard_ctx.drawImage(tileimage, 3*64, 1*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
			}
		}
		// Check if snake tail
		else if(index == arr.length - 1) {
			// Choose the correct orientation of the snake tail
			newDirection = arr[index-1].d;

			if (newDirection != snakePart.d)
			{
				if (newDirection == 'Up') {
					snakeboard_ctx.drawImage(tileimage, 3*64, 2*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Right') {
					snakeboard_ctx.drawImage(tileimage, 4*64, 2*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Down') {
					snakeboard_ctx.drawImage(tileimage, 4*64, 3*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else {
					snakeboard_ctx.drawImage(tileimage, 3*64, 3*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
			}
			else
			{
				if (snakePart.d == 'Up') {
					snakeboard_ctx.drawImage(tileimage, 3*64, 2*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (snakePart.d == 'Right') {
					snakeboard_ctx.drawImage(tileimage, 4*64, 2*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (snakePart.d == 'Down') {
					snakeboard_ctx.drawImage(tileimage, 4*64, 3*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else {
					snakeboard_ctx.drawImage(tileimage, 3*64, 3*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
			}
		}
		// Must be part of the body
		else
		{
			// Check if straight body or change of direction body image
			newDirection = arr[index-1].d;
			previousDirection = snakePart.d;
			
			if (previousDirection != newDirection)
			{
				if (newDirection == 'Up' && previousDirection == 'Left' || newDirection == 'Right' && previousDirection == 'Down') {
					snakeboard_ctx.drawImage(tileimage, 0*64, 1*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Up' && previousDirection == 'Right' || newDirection == 'Left' && previousDirection == 'Down') {
					snakeboard_ctx.drawImage(tileimage, 2*64, 2*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Left' && previousDirection == 'Up' || newDirection == 'Down' && previousDirection == 'Right') {
					snakeboard_ctx.drawImage(tileimage, 2*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else {
					snakeboard_ctx.drawImage(tileimage, 0*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
			}
			else
			{
				if (newDirection == 'Up') {
					snakeboard_ctx.drawImage(tileimage, 2*64, 1*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Right') {
					snakeboard_ctx.drawImage(tileimage, 1*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else if (newDirection == 'Down') {
					snakeboard_ctx.drawImage(tileimage, 2*64, 1*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
				else {
					snakeboard_ctx.drawImage(tileimage, 1*64, 0*64, 64, 64, snakePart.x, snakePart.y, cellSize, cellSize);
				}
			}
		}
    }

	function has_game_ended() {
		// Check if snake touches iteself
		for (let i = 4; i < snake.length; i++) {
			if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
		}
		
		// Check if snake head hits the wall
		const hitLeftWall = snake[0].x < 0;
		const hitRightWall = snake[0].x > snakeboard.width - cellSize;
		const hitToptWall = snake[0].y < 0;
		const hitBottomWall = snake[0].y > snakeboard.height - cellSize;
		return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
	}

    function random_food(min, max) {
		// Pick a random location for the food
		return Math.round((Math.random() * (max-min) + min) / cellSize) * cellSize;
    }

    function gen_food() {
		// Generate a random number the food x-coordinate
		food_x = random_food(0, snakeboard.width - cellSize);
		// Generate a random number for the food y-coordinate
		food_y = random_food(0, snakeboard.height - cellSize);
		// if the new food location is where the snake currently is, generate a new food location
		snake.forEach(function has_snake_eaten_food(part) {
			const has_eaten = part.x == food_x && part.y == food_y;
			if (has_eaten) gen_food();
		});
    }

    function change_direction(event) {
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;
		const UP_KEY = 38;
		const DOWN_KEY = 40;
      
		// Prevent the snake from reversing    
		if (changing_direction) return;
		changing_direction = true;
		const keyPressed = event.keyCode;
		const goingUp = dy === -cellSize;
		const goingDown = dy === cellSize;
		const goingRight = dx === cellSize;
		const goingLeft = dx === -cellSize;
		if (keyPressed === LEFT_KEY && !goingRight) {
			dx = -cellSize;
			dy = 0;
		}
		if (keyPressed === UP_KEY && !goingDown) {
			dx = 0;
			dy = -cellSize;
		}
		if (keyPressed === RIGHT_KEY && !goingLeft) {
			dx = cellSize;
			dy = 0;
		}
		if (keyPressed === DOWN_KEY && !goingUp) {
			dx = 0;
			dy = cellSize;
		}
    }

	function move_snake() {
		// Generate location for new snake's head
		if (dx == 0) {
			if (dy > 0) {
				direction = 'Down';
			}
			else {
				direction = 'Up';
			}
		}
		else {
			if (dx > 0) {
				direction = 'Right';
			}
			else {
				direction = 'Left';
			}
		}
	  
		const head = {x: snake[0].x + dx, y: snake[0].y + dy, d: direction};
		
		// Add the new head to the beginning of snake body
		snake.unshift(head);
		
		// Check if snake has eaten the food
		const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
		if (has_eaten_food) {
			// Increase score
			score += 1;
			// Display score on screen
			document.getElementById('score').innerHTML = score;
			// Generate new food location
			gen_food();
		} else {
			// Remove the last part of snake body
			snake.pop();
		}
	}