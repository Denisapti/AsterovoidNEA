
// initialising variables

// player health
var HPA = 1.0
var HPB = 1.0

// torpedo availibility (used in control loops)
var torpReadyA = true
var torpReadyB = true



function setup() {
	createCanvas(windowWidth, windowHeight);
	background(0);
	
	
	// border to prevent loss of ships in testing
	border = new Sprite(width/2, height/2, width, height);
	border.shape = 'chain'
	border.collider = 'static'
	
	// setup players
	playerA = new Sprite()
	playerA.color = "blue"
	playerA.x = width / 4
	playerA.y = height / 4
	playerA.h = 25
	playerA.w = 80
	playerA.offset.x = 15
	playerA.textSize = 15;
	playerA.text = "([]}--";
	playerA.rotationSpeed = 0
	
	playerB = new Sprite()
	playerB.color = "red"
	playerB.x = width - (width / 4)
	playerB.y = height - (height / 4)
	playerB.h = 25
	playerB.w = 80
	playerB.offset.x = 15
	playerB.textSize = 15;
	playerB.text = "([]}--";
	playerB.rotationSpeed = 0
	
	//setup healthbars to show health (controlled in check health loop)
	healthBarA = new Sprite()
	healthBarA.collider = "n"
	healthBarA.w = (width/2)-20	
	healthBarA.h = 30
	healthBarA.x = (healthBarA.w/2)+10
	healthBarA.text = "BLUE"
	healthBarA.y = 30
	healthBarA.color = "red"
	
	healthBarB = new Sprite()
	healthBarB.collider = "n"
	healthBarB.w = (width/2)-20	
	healthBarB.h = 30
	healthBarB.x = width - (healthBarB.w/2)+10
	healthBarB.text = "RED"
	healthBarB.y = 30
	healthBarB.color = "red"
	
	
	
	//bounciness(uncomment if bored)
	
	// playerA.bounciness = 1;
	// playerB.bounciness = 1;
	
	torpedoA = new Group()

		
	torpedoB = new Group()
	
	
	

	
	
}


// WIP for having UI fade when obstructed, might re-attempt

// function fadeUI(){
// 	opacity = 100
// 	playerA.overlaps(healthBarA && healthBarB)
	
// 	if ((playerA.overlaps(healthBarA || healthBarB))&&(opacity > 5)){
// 		opacity-=10
// 		console.log("over")
// 	}
// 	else if (opacity < 100){
// 		opacity += 10
// 	}
// 	healthBarA.color = color(255, 0, 0, opacity)
// 	healthBarB.color = color(255, 0, 0, opacity)
// }


	





function checkHP(){
	
	//tracks and updates player health, makes according changes to UI (health bars)
	
	healthBarA.w = ((width/2)-20)*HPA
	healthBarA.x = (healthBarA.w/2)+10	
	
	healthBarB.w = ((width/2)-20)*HPB
	healthBarB.x = width - (healthBarB.w/2)+10	
	// check death (ends game)
	if (HPA<=0){
		playerA.remove()
		alert("Player RED wins")
		throw new Error('Game Over')
	}
	if (HPB<=0){
		playerB.remove()
		alert("Player BLUE wins")
		throw new Error('Game Over')
	}
}

function runTorp(){
	
	//movement code for torpedos and tracking
	//no targeting system yet so the opposing player is hardcoded as the target
	
	for (i=0; i < torpedoA.length; i++){
		if(torpedoA[i].collides(playerB) == false){
			torpedoA[i].rotateTowards(playerB, 0.1, 0)
			torpedoA[i].moveTo(playerB.x, playerB.y, 2)
		}
		else{
			torpedoA[i].remove()
			clearTimeout(torpALifespan);
			torpReadyA = true
			HPB -= 0.05
		}
	}
	for (i=0; i < torpedoB.length; i++){
		if(torpedoB[i].collides(playerA)== false){
			torpedoB[i].rotateTowards(playerA, 0.1, 0);
			torpedoB[i].moveTo(playerA.x, playerA.y, 2)
		}
		else{
			torpedoB[i].remove()
			clearTimeout(torpBLifespan);
			torpReadyA = true
			HPA -= 0.05
		}
	}
}

function ctrlA(){
//use of contros[0] instead of contros, allows inputs from multiple controlers via increasing the contros[] array's index
	if(contros[0])
	{


		if ((contros[0].r) && (torpReadyA == true)){
			torpA =  new torpedoA.Sprite(playerA.x, playerA.y, [
			[25, 5],
			[-25, 5],
			[0, -10]
		]) 
			torpReadyA = false
			torpALifespan = setTimeout(function() {
			torpA.remove()
			torpReadyA = true
	}, 5000); // Time in milliseconds (5000 ms = 5 seconds)
		}
		if (contros[0].lt > 0.2){
			playerA.rotationSpeed -= 0.01 *contros[0].lt
		}
			if (contros[0].rt > 0.2){
			playerA.rotationSpeed += 0.01 *contros[0].rt
		}
				if (contros[0].leftStick.y < -0.2){

				playerA.bearing = playerA.rotation;
				playerA.applyForce(-11*contros[0].leftStick.y);
		}
					if (contros[0].leftStick.y > 0.2){

				playerA.bearing = playerA.rotation + 180;
				playerA.applyForce(2*contros[0].leftStick.y);
		}
					if (contros[0].leftStick.x > 0.2){

				playerA.bearing = playerA.rotation + 90;
				playerA.applyForce(2 * contros[0].leftStick.x);
		}
					if (contros[0].leftStick.x < -0.2){

				playerA.bearing = playerA.rotation + 270;
				playerA.applyForce(-2 * contros[0].leftStick.x);
		}
	}
}

function ctrlB(){
	if(contros[1]) 
	{
		
		       

		
		if ((contros[1].r) && (torpReadyB == true)){
			torpB =  new torpedoB.Sprite(playerB.x, playerB.y, [
				[25, 5],
				[-25, 5],
				[0, -10]
			]) 
			torpReadyB = false
			torpBLifespan = setTimeout(function() {
				torpB.remove()
				torpReadyB = true
			}, 5000); // Time in milliseconds (5000 ms = 5 seconds)
		}
		if (contros[1].lt > 0.2){
			playerB.rotationSpeed -= 0.01 * contros[1].lt
		}
		if (contros[1].rt > 0.2){
			playerB.rotationSpeed += 0.01 * contros[1].rt
		}
		if (contros[1].leftStick.y < -0.2){
			playerB.bearing = playerB.rotation;
			playerB.applyForce(-11 * contros[1].leftStick.y);
		}
		if (contros[1].leftStick.y > 0.2){
			playerB.bearing = playerB.rotation + 180;
			playerB.applyForce(2 * contros[1].leftStick.y);
		}
		if (contros[1].leftStick.x > 0.2){
			playerB.bearing = playerB.rotation + 90;
			playerB.applyForce(2 * contros[1].leftStick.x);
		}
		if (contros[1].leftStick.x < -0.2){
			playerB.bearing = playerB.rotation + 270;
			playerB.applyForce(-2 * contros[1].leftStick.x);
		}
	}
}






// old keyboard support for player 2 (I may decide to allow dual input from keyboard and controller)
// function ctrlB(){
// 		if ((kb.pressed('p'))&&(torpReadyB== true)){
// 		torpB =  new torpedoB.Sprite(playerB.x, playerB.y, [
// 		[25, 5],
// 		[-25, 5],
// 		[0, -10]
// 	]) 
// 			torpReadyB = false
// 			torpBLifespan = setTimeout(function() {
//     torpB.remove()
// 		torpReadyB = true
// }, 5000); // Time in milliseconds (5000 ms = 5 seconds)
// 	}
// 	if (kb.pressing('u')){
// 		playerB.rotationSpeed -= 0.1 
// 	}
// 		if (kb.pressing('o')){
// 		playerB.rotationSpeed += 0.1 
// 	}
// 			if (kb.pressing('i')){
			
// 			playerB.bearing = playerB.rotation;
// 			playerB.applyForce(11);
// 	}
// 				if (kb.pressing('k')){
			
// 			playerB.bearing = playerB.rotation + 180;
// 			playerB.applyForce(1);
// 	}
// 				if (kb.pressing('l')){
			
// 			playerB.bearing = playerB.rotation + 90;
// 			playerB.applyForce(1);
// 	}
// 				if (kb.pressing('j')){
			
// 			playerB.bearing = playerB.rotation + 270;
// 			playerB.applyForce(1);
// 	}
// }

function keyPressed(){
	ctrlA()
	ctrlB()
	
}


function draw() {
	clear()
	background(0)
	keyPressed()
	runTorp()
	checkHP()
  }
