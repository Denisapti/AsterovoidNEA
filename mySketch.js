
// initialising variables

roster = []
torpedos = []
bullets = []

// player health
var HPA = 1.0
var HPB = 1.0






function setup() {
	createCanvas(windowWidth, windowHeight);
	background(0);
	
	
	// border to prevent loss of ships in testing
	border = new Sprite(width/2, height/2, width, height);
	border.shape = 'chain'
	border.collider = 'static'
	
	// setup players

	interactables = new Group()


	players = new interactables.Group()
	players.collider = "d"
	players.color = "blue"
	players.h = 25
	players.w = 80
	players.textSize = 15;
	players.text = "([]}--";
	
	addPlayerShip()

	torpedosObjs = new interactables.Group()
	bulletObjs = new interactables.Group()
	
	asteroids = new interactables.Group()
	asteroids.diameter = 40
	asteroids.collider = "d"
	for (i=0;i< 5;i++)
	{
		asteroid = new asteroids.Sprite(((3/4)*width)+(i*10),(3/4)* height)
	}

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
	
	//  player.obj.bounciness = 1;
	

}


// WIP for having UI fade when obstructed, might re-attempt

// function fadeUI(){
// 	opacity = 100
// 	player.obj.overlaps(healthBarA && healthBarB)
	
// 	if ((player.obj.overlaps(healthBarA || healthBarB))&&(opacity > 5)){
// 		opacity-=10
// 		console.log("over")
// 	}
// 	else if (opacity < 100){
// 		opacity += 10
// 	}
// 	healthBarA.color = color(255, 0, 0, opacity)
// 	healthBarB.color = color(255, 0, 0, opacity)
// }


	
function addPlayerShip()
	{
		player = 
		{
			playerID: 0,
			obj: null
		}
		player.obj = new players.Sprite()
		player.obj.x = width / 4
		player.obj.y = height / 4
		player.obj.offset.x = 15
		player.abilities = ["torpedo", "gun"]
		player.abilityState = 0
		roster[player.playerID] = player
	}


// function updateInteractables(){
// 	interactables.removeAll()
// 	for (let i in roster){
// 		interactables.add(roster[i].obj)
// 	}
	
// 	for (let i in asteroids){
// 		interactables.add(asteroids[i])
// 	}

// 	for (let i in torpedos){
// 		interactables.add(torpedos[i].obj)
// 	}
// }

function checkHP(){
	
	//tracks and updates player health, makes according changes to UI (health bars)
	
	healthBarA.w = ((width/2)-20)*HPA
	healthBarA.x = (healthBarA.w/2)+10	
	
	healthBarB.w = ((width/2)-20)*HPB
	healthBarB.x = width - (healthBarB.w/2)+10	
	// check death (ends game)
	if (HPA<=0){
		player.obj.remove()
		alert("Player RED wins")
		throw new Error('Game Over')
	}

}

function runTorp(){
	
	//movement code for torpedos and tracking
	//no targeting system yet so the opposing player is hardcoded as the target
	
	for (i=0; i < torpedos.length; i++){
		console.log(torpedos[i])
		if(torpedos[i].obj.collides(torpedos[i].target) == false){
			torpedos[i].obj.rotateTowards(torpedos[i].target, 0.1, 0)
			torpedos[i].obj.moveTo(torpedos[i].target.x, torpedos[i].target.y, 2)
		}
		else{
			console.log()
			torpedos[i].obj.remove()
			clearTimeout(torpedos[i].lifespan);
			torpedos.splice(i)
			
		}
	}

}


function launchTorp(playerID, target){
	console.log("torplaunchtriggered")
		if ( target != null){
			console.log("target valid")
			let torp = {}

			torp.owner = playerID
			torp.obj =  new Sprite(roster[playerID].obj.x, roster[playerID].obj.y, [
			[25, 5],
			[-25, 5],
			[0, -10]
		]) 
	
			torp.target = target
			torp.status = false
			torp.lifespan = setTimeout(function(){
				
				torp.obj.remove()
				torp = null 
			}  , 5000); // Time in milliseconds (5000 ms = 5 seconds)
	
			//ensure torpedo takes first avalible slot
	
			found = false
			for (i in torpedos)
				{
	
					if (torpedos[i] == null)
						{
							torpedos[i]=torp
							found = true
						}
				}
			if (found == false)
				{
					torpedos.push(torp)
					torpedosObjs.add(torp.obj)
				}
	
	
	
		}
	}




	function fireGun(playerID, bearing, power){
		console.log("gunFireTriggered")
			
		let bulletOriginVector = calculateBearingLineEnd( bearing , 100)
				
			let bullet = {}

			bullet.owner = playerID
			bullet.obj =  new Sprite(roster[playerID].obj.x + bulletOriginVector.x, roster[playerID].obj.y + bulletOriginVector.y, [
			[25, 5],
			[-25, 5],
			[0, -10]
			]) 
			
			bullet.obj.bearing = bearing
			bullet.obj.applyForce(2*power)
			

			bullet.status = false
			bullet.lifespan = setTimeout(function(){
					
			bullet.obj.remove()
			bullet = null 
			}  , 5000); // Time in milliseconds (5000 ms = 5 seconds)
	
			//ensure bullet takes first avalible slot
	
			found = false
			for (i in bullets)
				{
	
					if (bullets[i] == null)
						{
							bullets[i]=bullet
							found = true
						}
				}
			if (found == false)
				{
					bullets.push(bullet)
					bulletObjs.add(bullet.obj)
				}
	
			
		
			
		}



		
function findBearing(x,y){
	let theta = Math.atan2(y, x); // atan2 handles the quadrant adjustments
    let bearing = theta * (180 / Math.PI); // Convert radians to degrees
	if (bearing < 0) 
		{
			bearing += 360
		}
	return bearing
}

function calculateBearingLineEnd(bearing, length) {
	let x
	let y
	switch (true)
	{
		case bearing>270:
			theta = bearing -270
			x = (sin(theta)*length)
			y = -(cos(theta)*length)
			break;
		
		case bearing>180:
			theta = bearing -180
			x = -(cos(theta)*length)
			y = -(sin(theta)*length)
			break;
		
		case bearing>90:
			theta = bearing -90
			x = -(sin(theta)*length)
			y = cos(theta)*length
			break;

		case bearing >= 0:
			theta = bearing
			x = (cos(theta)*length)
			y = (sin(theta)*length)

	}

	return createVector(x, y);
  }




function ctrl(playerID){
//use of contros[playerID] instead of contros, allows inputs from multiple controlers via increasing the contros[] array's index
	if(contros[playerID])
	{
		roster[playerID].playerLocation = createVector(roster[playerID].obj.x, roster[playerID].obj.y)

		contros[playerID].rightStick.bearing = findBearing(contros[playerID].rightStick.x,contros[playerID].rightStick.y)

		//hotbar switcher
		if (contros[playerID].presses('left')){
			if (roster[playerID].abilityState == 0)
			{
				
				roster[playerID].abilityState = roster[playerID].abilities.length - 1
			}
			else
			{
				roster[playerID].abilityState -= 1
			}
			console.log(roster[playerID].abilityState)
		}

		if (contros[playerID].presses('right')){
			if (roster[playerID].abilityState == roster[playerID].abilities.length - 1)
			{
				
				roster[playerID].abilityState = 0
			}
			else
			{
				roster[playerID].abilityState += 1
			}
			console.log(roster[playerID].abilityState)
		}

		// torpedo control code 
		if (roster[playerID].abilities[roster[playerID].abilityState] == "torpedo")
		{
			if (contros[playerID].r > 0)
				{
				
					if (contros[playerID].r < 2)
						{
							// create ray
							rayDistance = 600
							roster[playerID].targRay = new Sprite(roster[playerID].obj.x + rayDistance, roster[playerID].obj.y, 1000, 1, "n")
							
							


						}
					else
					{
						// check ray existence
						if (roster[playerID].targRay != null)
							{console.log("ray exists")
								
								// take input from right stick and point ray there

								if (((contros[playerID].rightStick.y < -0.2) || (contros[playerID].rightStick.y > 0.2))||((contros[playerID].rightStick.x < -0.2) || (contros[playerID].rightStick.x > 0.2)))
									{
										
										roster[playerID].targRay.rotation = contros[playerID].rightStick.bearing
									}

								//update ray X,Y cords
								
								roster[playerID].targRay.LocationVector = calculateBearingLineEnd( contros[playerID].rightStick.bearing , rayDistance)

								roster[playerID].targRay.x = roster[playerID].obj.x + roster[playerID].targRay.LocationVector.x
								roster[playerID].targRay.y = roster[playerID].obj.y + roster[playerID].targRay.LocationVector.y

								

								// then check for overlaps with valid targets
								for (let i of interactables)
									{console.log("checkin overlap")
										if (roster[playerID].targRay.overlaps(i))
										{
											if (i != roster[playerID].obj) 
												{
													console.log("Overlap found")
													roster[playerID].target = i
												}
										}
										
									}	



							}
					}
					
				}
			else  
				{
					if (roster[playerID].prevFramePressedRB == true)
						{console.log("fire!")
							roster[playerID].targRay.remove()
							launchTorp(playerID,roster[playerID].target)
							roster[playerID].target = null
						}
					
				}
		}



		// gun control code 
		if (roster[playerID].abilities[roster[playerID].abilityState] == "gun")
			{ console.log("gun")
				if (contros[playerID].r > 0)
					{
					
						if (contros[playerID].r < 2)
							{
								// create ray
								rayDistance = 100
								rayLength = 200
								roster[playerID].targRay = new Sprite(roster[playerID].obj.x + rayDistance, roster[playerID].obj.y, rayLength, 1, "n")
								
								
	
	
							}
						else
						{
							// check ray existence
							if (roster[playerID].targRay != null)
								{console.log("ray exists")
									
									// take input from right stick and point ray there
	
									if (((contros[playerID].rightStick.y < -0.2) || (contros[playerID].rightStick.y > 0.2))||((contros[playerID].rightStick.x < -0.2) || (contros[playerID].rightStick.x > 0.2)))
										{
											
											roster[playerID].targRay.rotation = contros[playerID].rightStick.bearing
										}
	
									//update ray X,Y cords
									
									roster[playerID].targRay.LocationVector = calculateBearingLineEnd( contros[playerID].rightStick.bearing , rayDistance)
	
									roster[playerID].targRay.x = roster[playerID].obj.x + roster[playerID].targRay.LocationVector.x
									roster[playerID].targRay.y = roster[playerID].obj.y + roster[playerID].targRay.LocationVector.y
									rayDistance += 1
									rayLength += 1
									roster[playerID].targRay.width = rayLength

								}
						}
						
					}
				else  
					{
						if (roster[playerID].prevFramePressedRB == true)
							{console.log("fire!")
								
								// fire gun

								fireGun(playerID, contros[playerID].rightStick.bearing, rayDistance)

								roster[playerID].targRay.remove()
							}
						
					}
			}



		if (contros[playerID].lt > 0.2){
			roster[playerID].obj.rotationSpeed -= 0.01 *contros[playerID].lt
		}
		if (contros[playerID].rt > 0.2){
			roster[playerID].obj.rotationSpeed += 0.01 *contros[playerID].rt
		}
		if (contros[playerID].leftStick.y < -0.2){

			roster[playerID].obj.bearing = roster[playerID].obj.rotation;
			roster[playerID].obj.applyForce(-11*contros[playerID].leftStick.y);
		}
		if (contros[playerID].leftStick.y > 0.2){

			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 180;
			roster[playerID].obj.applyForce(2*contros[playerID].leftStick.y);
		}
		if (contros[playerID].leftStick.x > 0.2){

			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 90;
			roster[playerID].obj.applyForce(2 * contros[playerID].leftStick.x);
		}
		if (contros[playerID].leftStick.x < -0.2){

			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 270;
			roster[playerID].obj.applyForce(-2 * contros[playerID].leftStick.x);
		}




		//track state for next frame
		if ((contros[playerID].r>=1) )
			{
				roster[playerID].prevFramePressedRB = true
				
			}
		else
			{
				roster[playerID].prevFramePressedRB = false
			}
  }
}

//function ctrlB(){          disabled
// 	if(contros[1]) 
// 	{
		
		       

		
// 		if ((contros[1].r) && (torpReadyB == true)){
// 			torpB =  new torpedoB.Sprite(playerB.x, playerB.y, [
// 				[25, 5],
// 				[-25, 5],
// 				[0, -10]
// 			]) 
// 			torpReadyB = false
// 			torpBLifespan = setTimeout(function() {
// 				torpB.remove()
// 				torpReadyB = true
// 			}, 5000); // Time in milliseconds (5000 ms = 5 seconds)
// 		}
// 		if (contros[1].lt > 0.2){
// 			playerB.rotationSpeed -= 0.01 * contros[1].lt
// 		}
// 		if (contros[1].rt > 0.2){
// 			playerB.rotationSpeed += 0.01 * contros[1].rt
// 		}
// 		if (contros[1].leftStick.y < -0.2){
// 			playerB.bearing = playerB.rotation;
// 			playerB.applyForce(-11 * contros[1].leftStick.y);
// 		}
// 		if (contros[1].leftStick.y > 0.2){
// 			playerB.bearing = playerB.rotation + 180;
// 			playerB.applyForce(2 * contros[1].leftStick.y);
// 		}
// 		if (contros[1].leftStick.x > 0.2){
// 			playerB.bearing = playerB.rotation + 90;
// 			playerB.applyForce(2 * contros[1].leftStick.x);
// 		}
// 		if (contros[1].leftStick.x < -0.2){
// 			playerB.bearing = playerB.rotation + 270;
// 			playerB.applyForce(-2 * contros[1].leftStick.x);
// 		}
// 	}
//}






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
	ctrl(0)
	
}


function draw() {
	clear()
	background(0)

	keyPressed()
	runTorp()
	checkHP()
  }
