// initialising variables
stations = []
roster = [];
torpedos = [];
bullets = [];
asteroids = []
mini = {};
// player health
var HPA = 1.0;
var HPB = 1.0;

function setup() {
	createCanvas(windowWidth,windowHeight);

	background(0);
	console.log("main start");

	// allSprites.autoUpdate = false; // Disable automatic update so i can draw both (No longer applicable)
	// p5 and p5play in a controlled way (see draw())

	// border to prevent loss of ships in testing <disabled>
	// border = new Sprite(width/2, height/2, width, height);
	// border.shape = 'chain'
	// border.collider = 'static'

	//rescale camera and canvas accordingly <abandoned solution>
	// find canvas resoloution / 1920X1080 (typical size)

	// rescale = canvas.w/1920

	// camera.zoom = rescale  </abandoned solution>

	//calculate player horizon
	//    _______
	//   √a^2+b^2 = c
	//
	//to find hypotenuse of a quarter of the
	// circumcircle's rectangle (viewport)

	playerHorizon = findRadius(canvas.hw, canvas.hh);

	// select a world radius that is 2x the diameter of
	// the players vision, which is 2x the player's horizon radius
	worldRadius = playerHorizon * 2 * 2;
	bufferRadius = worldRadius + playerHorizon;

	// setup players

	interactables = new Group();
	
	valuables = new interactables.Group();
	valuables.collider = "d";
	valuables.color = "yellow";
	valuables.diameter = 20;

	players = new interactables.Group();
	players.collider = "d";
	players.color = "blue";
	players.h = 25;
	players.w = 80;
	players.textSize = 15;
	players.text = "([]}--";

	stationBodies = new interactables.Group();
	stationBodies.collider = "d";
	stationBodies.width = 208
	stationBodies.height = 9
	stationBodies.image = loadImage("stationBody.png")

	stationLeftWing = new interactables.Group();
	stationLeftWing.collider = "d";	
	stationLeftWing.width = 50
	stationLeftWing.height = 50
	stationLeftWing.image = loadImage("stationLeftWing.png")
	

	torpedosObjs = new interactables.Group();
	bulletObjs = new interactables.Group();

	asteroidNodes = new interactables.Group();
	asteroidNodes.color = "grey";
	asteroidNodes.health = 10 
	asteroidNodes.value = 10
	asteroidNodes.diameter = 10;
	asteroidNodes.collider = "d";
	asteroidNodes.bounciness = 0

	asteroidValNodes = new interactables.Group();
	asteroidValNodes.color = "red";
	asteroidValNodes.health = 15
	asteroidValNodes.value = 30
	asteroidValNodes.diameter = 10;
	asteroidValNodes.collider = "d";
	asteroidValNodes.bounciness = 0
	
	drills = new interactables.Group();
	drills.color = "grey";
	drills.health = 250
	drills.value = 20
	drills.durability = 150
	drills.mass = 1
	
	addStation()
	addPlayerShip(stations[0]);

	//setup healthbars to show health (controlled in check health loop) <abandoned>
	// healthBarA = new Sprite();
	// healthBarA.collider = "n";
	// healthBarA.w = width / 2 - 20;
	// healthBarA.h = 30;
	// healthBarA.x = healthBarA.w / 2 + 10;
	// healthBarA.text = "BLUE";
	// healthBarA.y = 30;
	// healthBarA.color = "red";

	// healthBarB = new Sprite();
	// healthBarB.collider = "n";
	// healthBarB.w = width / 2 - 20;
	// healthBarB.h = 30;
	// healthBarB.x = width - healthBarB.w / 2 + 10;
	// healthBarB.text = "RED";
	// healthBarB.y = 30;
	// healthBarB.color = "red";

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

function addStation() 
{
	station = {}
	station.bodyObj = new stationBodies.Sprite();
	station.players = []
	station.bodyObj.health = 1000
	station.bodyObj.maxHealth = 1000
	station.bodyObj.value = 0
	station.bodyObj.durability = 300

	stations.push(station)
}

function addPlayerShip(station) {
	player = {
		playerID: 0,
		obj: null,
	};
	player.obj = new players.Sprite();
	player.obj.x = width / 4;
	player.obj.y = height / 4;
	player.obj.offset.x = 15;
	player.obj.health = 100
	player.obj.maxHealth = 100
	player.obj.value = 0
	player.obj.durability = 100
	player.abilities = ["torpedo", "gun"];
	player.abilityState = 0;
	station.players.push(player)
	player.station = station;
	roster[player.playerID] = player;

	//create and attach a drill to the player
	drill = new drills.Sprite((player.obj.x + (player.obj.width/2) +30), player.obj.y, 
		[
			[35, 10],
			[-35, 10],
			[0, -20],
		]
	)
	//attach drill to player via glue joint
	new GlueJoint(player.obj, drill)
	drill.playerID = player.playerID
	drill.mass = 0
}

function mine(node, drill)
{
	//mine a node
	//find the asteroid that the node is in
	for (let a of asteroids)//this validation might be 
	{       //unneccessary I will look into removing it
		if (a.nodes.includes(node))
		{
			//damage the node
			node.health -= drill.durability
		}
	}
}

function drillCollection()
{
	//for each drill, move 1 value from it to its player if it has any
	for (let d of drills)
	{
		if (d.value > 0)
		{
			roster[d.playerID].obj.value += 1
			d.value -= 1
		}
	}
}

function genAsteroid(xVal, yVal, standard, valNodes)
{
	//create contoller object
	let maxDist = 45
	asteroid = {}
	asteroid.nodes = []
	asteroid.normal = standard //normal node count passed in is assigned to the normal node count of the asteroid
	asteroid.valuable = valNodes
	asteroid.size = asteroid.normal + asteroid.valuable
	asteroid.centerMass = 
	{
		x: xVal,
		y: yVal
	}
	//creates normal nodes
	for (i=0; i<asteroid.normal; i++)
	{
		let xNode = getRandomNumber(-maxDist, maxDist) + asteroid.centerMass.x
		let yNode = getRandomNumber(-maxDist, maxDist) + asteroid.centerMass.y
		asteroidNode = new asteroidNodes.Sprite(xNode, yNode)
		asteroidNode.durability = 15
		asteroid.nodes.push(asteroidNode)
	}
	//creates valuable nodes
	for (i=0; i<asteroid.valuable; i++)
	{
		let xNode = getRandomNumber(-maxDist + 20, maxDist - 20) + asteroid.centerMass.x
		let yNode = getRandomNumber(-maxDist + 20, maxDist - 20) + asteroid.centerMass.y
		asteroidNode = new asteroidValNodes.Sprite(xNode, yNode)
		asteroidNode.durability = 25
		asteroid.nodes.push(asteroidNode)
	}
	//inject controller obj into array at first availible position
    let success = false;
    for (let i in asteroids) {
        if ((!asteroids[i]) && (!success)) {
            asteroids[i] = asteroid;
            success = true;
        }

    }

    // If no empty slot was found, push the new asteroid to the array
    if (!success) {
        asteroids.push(asteroid);
    }

    console.log("Asteroid generated:" + asteroid);
}


function updateAsteroids()
{
    for (i=0; i<asteroids.length; i++)
    {
        /// make asteroid stay together
        // find the center of all its nodes
        let xTotal = 0
        let yTotal = 0
		// number of live nodes 
		let numNodes = 0
        // sum all x and y values
        for (j=0; j<asteroids[i].nodes.length; j++)
        {
			if (asteroids[i].nodes[j].body != null)
			{
				xTotal += asteroids[i].nodes[j].x
				yTotal += asteroids[i].nodes[j].y
				numNodes++
			}
		}
		
        // find the average
        let xCenter = xTotal/numNodes
        let yCenter = yTotal/numNodes
        //adjust the asteroid's center of mass
        asteroids[i].centerMass.x = xCenter
        asteroids[i].centerMass.y = yCenter
		//log the center of mass
		console.log("Center of mass: x:"+xCenter+" y:"+yCenter)


        // move all nodes towards the center
        for (j=0; j<asteroids[i].nodes.length; j++)
        {
			// move the node towards the center of mass
			//only if node isnt dead
			if ((asteroids[i].nodes[j].body != null) )
			{
				console.log("moving node")
				asteroids[i].nodes[j].attractTo(asteroids[i].centerMass.x, asteroids[i].centerMass.y, 0.1)
			}
        }
    }
}

function maintainAsteroids()
{
	//removes asteroids with no nodes
	let nodecount = 0
	for (i=0; i<asteroids.length; i++)
	{	
		for (j=0; j<asteroids[i].nodes.length; j++)
		{
			if (asteroids[i].nodes[j].body != null)
			{
				nodecount++
			}
		}
	}
	if (nodecount == 0)
	{
		asteroids[i] = null
		console.log("Asteroid No:"+i+" removed")
	}

	//count asteroids
	let asteroidCount = 0
	for (i=0; i<asteroids.length; i++)
	{
		if (asteroids[i] != null)
		{
			asteroidCount += 1
		}
	}
	//if asteroid count is below expected, spawn a new asteroid
	expectedAsteroids = 10
	if (asteroidCount < expectedAsteroids)
	{
		//find a random location
		let xVal = getRandomNumber(-worldRadius + 200, worldRadius -200)
		let yVal = getRandomNumber(-worldRadius + 200, worldRadius -200)
		//find a random size
		let standard = getRandomNumber(15, 45)
		let valNodes = getRandomNumber(1, 5)
		//generate the asteroid
		genAsteroid(xVal, yVal, standard, valNodes)
	}

	updateAsteroids()
}

function detectCollision() 
	{
    	//detects collisions between all objects in interactables
    	for (let i of interactables) 
		{
        	for (let j of interactables) 
			{
            	if (i != j) 
				{
					if (i.collides(j)) 
					{
						
						let shouldDmg = true;
						//collision detected
						// console.log("collision detected")

						// check if i is in valuables group
						if (valuables.contains(i)) 
						{
							// if i is a valuable, it is collected
							i.remove();
							j.value += i.value;
						} 
						else if (valuables.contains(j)) 
						{
							// if j is a valuable, it is collected
							j.remove();
							i.value += j.value;
						} 

					
						//check if i or j are a drill
						if (drills.contains(i) || drills.contains(j))
						{
							//check if i or j are a an asteroid node in any asteroid
							for (let a of asteroids)
							{
								if (a.nodes.includes(i) )
								{
									//if the node is in an asteroid, mine it
									mine(i, j)
									shouldDmg = false
								}
								else if (a.nodes.includes(j))
								{
									//if the node is in an asteroid, mine it
									mine(j, i)
									shouldDmg = false
								}
							}
							
						}
						
						// check if i is in the same asteroid as j
						if (asteroidNodes.contains(i) && asteroidNodes.contains(j)) 
						{
							// if i and j are both in the same asteroid, dont damage them
							// find the asteroid that both i and j are in
							
							for (let a of asteroids) 
								{
									if (a.nodes.includes(i) && a.nodes.includes(j)) 
										{
											console.log("same asteroid")
											shouldDmg = false;
											break;
									}
								}
							// dont damage the asteroid
						}
						if (shouldDmg)
						{
							// kinetic damage is applied to both objects
							kineticDamage(i, j);
						}
					}

                }																																																		
            }
        }
    }


function kineticDamage(obj1, obj2) 
{

	// find the relative speed of the two objects
	let relativeSpeed = p5.Vector.sub(obj1.vel, obj2.vel).mag();

    // Log the relative speed and durability values
    console.log(`Relative Speed: ${relativeSpeed}`);
    console.log(`Obj1 Durability: ${obj1.durability}, Obj2 Durability: ${obj2.durability}`);

    // Ensure relativeSpeed is a valid number
    if (isNaN(relativeSpeed)) {
        console.error("Relative speed is NaN");
        return;
    }

    // Ensure durability values are valid numbers
    if (isNaN(obj1.durability) || isNaN(obj2.durability)) {
        console.error("Durability is NaN");
        return;
    }
	
	// find damage for obj1
	let dmg1 = relativeSpeed * (obj2.durability / obj1.durability);
	// find damage for obj2
	let dmg2 = relativeSpeed * (obj1.durability / obj2.durability);

    // Log the calculated damage values
    console.log(`Damage to Obj1: ${dmg1}, Damage to Obj2: ${dmg2}`);

    // Ensure damage values are valid numbers
    if (isNaN(dmg1) || isNaN(dmg2)) {
        console.error("Damage is NaN");
        return;
    }

	// apply damage to objs
	obj1.health -= dmg1;
	obj2.health -= dmg2;

    // Log the new health values
    console.log(`Obj1 Health: ${obj1.health}, Obj2 Health: ${obj2.health}`);
}

function detectDeath() {
	//detects if any object has health below 0
	
	for (let i of interactables) {
		if (i.health <= 0) {
			if (players.contains(i))
			{
				alert("you died")
				

			}
			console.log("detecting death")
			killObj(i);
		}
	}
}


function killObj(obj) {
	console.log("killing object")
	// spawns a valuable where the object was
	let valuable = new valuables.Sprite(obj.x, obj.y);
	// valueables inherit the value of the object
	valuable.value = obj.value	
	console.log("valuable spawned")


	//removes object from interactables
	obj.remove();
	console.log(obj)
	console.log("object removed")
}

function followCamera(target) 
{
	// camera.zoom
	camera.x = target.x + target.vel.x * -3; // follows with a delay based on
	camera.y = target.y + target.vel.y * -3; // the target's velocity
	
}

// function updateInteractables(){<abandoned solution>
// 	interactables.removeAll()
// 	for (let i in roster){
// 		interactables.add(roster[i].obj)
// 	}


// 	for (let i in asteroidNodes){
// 		interactables.add(asteroidNodes[i])
// 	}


// 	for (let i in torpedos){
// 		interactables.add(torpedos[i].obj)
// 	}
// }</abandoned solution>

function enforceBorders() {
	for (i of interactables) {
		//check every game object
		objectRadius = findRadius(i.x, i.y); //determine distance from map core
		if (objectRadius > worldRadius) {
			//assess zoneing
			if (objectRadius < bufferRadius) {
				//mirror the object
				//mirrorObject(i);
			} else {

				//if its part of an asteroid
				if ((!asteroidNodes.includes(i)) && (!asteroidValNodes.includes(i)))
				{
					//teleport the object
					crossBorder(i);
				}
				else
				{
					// check the asteroids crossing the border
					for (j of asteroids)
					{
						let jRad = findRadius(j.centerMass.x, j.centerMass.y)
						if (jRad < bufferRadius)
						{
							for (k of j.nodes)
							{
								crossBorder(k)
							}
						}
					}
				}
				
				//endMirror(i); // remove mirrored slave
			}
		} else {
			//endMirror(i);
		}
	}
}

function crossBorder(obj) {


	obj.x *= -1; //teleports an object to the opposite end of the map
	obj.y *= -1;
}

function endMirror(obj) {
	if (obj.slave) {
		obj.slave.remove();
	}
}

function mirrorObject(obj) {
	//target should be the actual
	//interactables P5 instance not a managment object
	if (!obj.slave) {
		// ensure a slave is present
		obj.slave = new players.Sprite();
	}
	//relocate the slave to the opposite mirror region
	obj.slave.x = obj.x * -1;
	obj.slave.y = obj.x * -1;
	if (obj.slave.x < 0) {
		obj.slave.x -= playerHorizon;
	} else {
		obj.slave.x -= playerHorizon;
	}
	if (obj.slave.y < 0) {
		obj.slave.y -= playerHorizon;
	} else {
		obj.slave.y -= playerHorizon;
	}
}

//function checkHP()<abandoned solution>
// {

// 	//tracks and updates player health, makes according changes to UI (health bars)

// 	healthBarA.w = ((width/2)-20)*HPA
// 	healthBarA.x = (healthBarA.w/2)+10

// 	healthBarB.w = ((width/2)-20)*HPB
// 	healthBarB.x = width - (healthBarB.w/2)+10
// 	// check death (ends game)
// 	if (HPA<=0){
// 		player.obj.remove()
// 		alert("Player RED wins")
// 		throw new Error('Game Over')
// 	}

// }</abandoned solution>

function runTorp() {
	//movement code for torpedos and tracking
	//targeting system implemented so the opposing player is no longer hardcoded as the target

	for (i = 0; i < torpedos.length; i++) {
		console.log(torpedos[i]);
		if (torpedos[i].obj.collides(torpedos[i].target) == false) {
			torpedos[i].obj.rotateTowards(torpedos[i].target, 0.1, 0);
			torpedos[i].obj.moveTo(torpedos[i].target.x, torpedos[i].target.y, 6);
		} else {
			
			
			clearTimeout(torpedos[i].lifespan);
			torpedos.splice(i);
		}
	}
}

function launchTorp(playerID, target) {
	console.log("torplaunchtriggered");
	// let torpedoAvalibility = true;
	// for (i = 0; i < torpedos.length; i++) {
	// 	if (torpedos[i].owner == playerID) {
	// 		torpedoAvalibility = false;
	// 	}
	//}
	if (target != null ) {        //&& torpedoAvalibility
		console.log("target valid");

		let torpOriginVector = calculateBearingLineEnd(
			contros[playerID].rightStick.bearing,
			50
		);

		let torp = {};

		torp.owner = playerID;
		torp.obj = new Sprite(
			roster[playerID].obj.x + torpOriginVector.x,
			roster[playerID].obj.y + torpOriginVector.y,
			[
				[35, 3],
				[-35, 3],
				[0, -6],
			]
		);

		torp.target = target;
		torp.status = false;
		torp.obj.health = 2
		torp.obj.durability = 50
		torp.lifespan = setTimeout(function () {
			torp.obj.remove();
			torp = null;
		}, 5000); // Time in milliseconds (5000 ms = 5 seconds)

		//ensure torpedo takes first avalible slot

		found = false;
		for (i in torpedos) {
			if (torpedos[i] == null) {
				torpedos[i] = torp;
				torpedosObjs.add(torp.obj);

				found = true;
			}
		}
		if (found == false) {
			torpedos.push(torp);
			torpedosObjs.add(torp.obj);
		}
	}
}

function fireGun(playerID, bearing, power) {
	console.log("gunFireTriggered");

	let bulletOriginVector = calculateBearingLineEnd(bearing, 50);

	let bullet = {};

	bullet.owner = playerID;
	bullet.obj = new Sprite(
		roster[playerID].obj.x + bulletOriginVector.x,
		roster[playerID].obj.y + bulletOriginVector.y,
		[
			[15, 5],
			[-15, 5],
			[0, -10],
		]
	);

	bullet.obj.bearing = bearing;
	bullet.health = 10
	bullet.obj.applyForce(0.5 * power);
	bullet.obj.durability = 50

	bullet.status = false;
	bullet.lifespan = setTimeout(function () {
		bullet.obj.remove();
		bullet = null;
	}, 5000); // Time in milliseconds (5000 ms = 5 seconds)

	//ensure bullet takes first avalible slot

	found = false;
	for (i in bullets) {
		if (bullets[i] == null) {
			bullets[i] = bullet;
			found = true;
		}
	}
	if (found == false) {
		bullets.push(bullet);
		bulletObjs.add(bullet.obj);
	}
}

function findBearing(x, y) {
	// finds a bearing from the origin to the coordinates
	let theta = Math.atan2(y, x); // atan2 handles the quadrant adjustments
	let bearing = theta * (180 / Math.PI); // Convert radians to degrees
	if (bearing < 0) {
		bearing += 360;
	}
	return bearing;
}

function findRadius(x, y) {
	// finds the radius of the circle drawn
	// through a point, with its center at the origin
	return Math.sqrt(x ** 2 + y ** 2);
}

function calculateBearingLineEnd(bearing, length) {
	// converts polar to carteasian coords
	let x;
	let y;
	switch (true) {
		case bearing > 270:
			theta = bearing - 270;
			x = sin(theta) * length;
			y = -(cos(theta) * length);
			break;

		case bearing > 180:
			theta = bearing - 180;
			x = -(cos(theta) * length);
			y = -(sin(theta) * length);
			break;

		case bearing > 90:
			theta = bearing - 90;
			x = -(sin(theta) * length);
			y = cos(theta) * length;
			break;

		case bearing >= 0:
			theta = bearing;
			x = cos(theta) * length;
			y = sin(theta) * length;
	}

	return createVector(x, y);
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function ctrl(playerID) {

	//health debug suicide code
	if (kb.presses("d"))
	{
		roster[playerID].obj.health -= 1
	}



	//use of contros[playerID] instead of contros, allows inputs from multiple controlers via increasing the contros[] array's index
	if (contros[playerID]) {
		roster[playerID].playerLocation = createVector(
			roster[playerID].obj.x,
			roster[playerID].obj.y
		);

		contros[playerID].rightStick.bearing = findBearing(
			contros[playerID].rightStick.x,
			contros[playerID].rightStick.y
		);

		//hotbar switcher
		if (contros[playerID].presses("left")) {
			if (roster[playerID].abilityState == 0) {
				roster[playerID].abilityState = roster[playerID].abilities.length - 1;
			} else {
				roster[playerID].abilityState -= 1;
			}
			console.log(roster[playerID].abilityState);
		}

		if (contros[playerID].presses("right")) {
			if (
				roster[playerID].abilityState ==
				roster[playerID].abilities.length - 1
			) {
				roster[playerID].abilityState = 0;
			} else {
				roster[playerID].abilityState += 1;
			}
			console.log(roster[playerID].abilityState);
		}

		// torpedo control code
		if (
			roster[playerID].abilities[roster[playerID].abilityState] == "torpedo"
		) {
			if (contros[playerID].r > 0) {
				if (contros[playerID].r < 2) {
					// create ray
					rayDistance = 600;
					roster[playerID].targRay = new Sprite(
						roster[playerID].obj.x + rayDistance,
						roster[playerID].obj.y,
						1000,
						1,
						"n"
					);
				} else {
					// check ray existence
					if (roster[playerID].targRay != null) {
						console.log("ray exists");

						// take input from right stick and point ray there

						if (
							contros[playerID].rightStick.y < -0.2 ||
							contros[playerID].rightStick.y > 0.2 ||
							contros[playerID].rightStick.x < -0.2 ||
							contros[playerID].rightStick.x > 0.2
						) {
							roster[playerID].targRay.rotation =
								contros[playerID].rightStick.bearing;
						}

						//update ray X,Y cords

						roster[playerID].targRay.LocationVector = calculateBearingLineEnd(
							contros[playerID].rightStick.bearing,
							rayDistance
						);

						roster[playerID].targRay.x =
							roster[playerID].obj.x +
							roster[playerID].targRay.LocationVector.x;
						roster[playerID].targRay.y =
							roster[playerID].obj.y +
							roster[playerID].targRay.LocationVector.y;

						// then check for overlaps with valid targets
						for (let i of interactables) {
							// of means i is the item not the index
							console.log("checkin overlap");
							if (roster[playerID].targRay.overlaps(i)) {
								if (i != roster[playerID].obj) {
									console.log("Overlap found");
									roster[playerID].target = i;
								}
							}
						}
					}
				}
			} else {
				if (roster[playerID].prevFramePressedRB == true) {
					console.log("fire!");
					
					launchTorp(playerID, roster[playerID].target);
					roster[playerID].target = null;
					roster[playerID].targRay.remove();
				}
			}
		}

		// gun control code
		if (roster[playerID].abilities[roster[playerID].abilityState] == "gun") {
			console.log("gun");
			if (contros[playerID].r > 0) {
				if (contros[playerID].r < 2) {
					// create ray
					rayDistance = 100;
					rayLength = 200;
					roster[playerID].targRay = new Sprite(
						roster[playerID].obj.x + rayDistance,
						roster[playerID].obj.y,
						rayLength,
						1,
						"n"
					);
				} else {
					// check ray existence
					if (roster[playerID].targRay != null) {
						console.log("ray exists");

						// take input from right stick and point ray there

						if (
							contros[playerID].rightStick.y < -0.2 ||
							contros[playerID].rightStick.y > 0.2 ||
							contros[playerID].rightStick.x < -0.2 ||
							contros[playerID].rightStick.x > 0.2
						) {
							roster[playerID].targRay.rotation =
								contros[playerID].rightStick.bearing;
						}

						//update ray X,Y cords

						roster[playerID].targRay.LocationVector = calculateBearingLineEnd(
							contros[playerID].rightStick.bearing,
							rayDistance
						);

						roster[playerID].targRay.x =
							roster[playerID].obj.x +
							roster[playerID].targRay.LocationVector.x;
						roster[playerID].targRay.y =
							roster[playerID].obj.y +
							roster[playerID].targRay.LocationVector.y;
						rayDistance += 1;
						rayLength += 1;
						roster[playerID].targRay.width = rayLength;
					}
				}
			} else {
				if (roster[playerID].prevFramePressedRB == true) {
					console.log("fire!");

					// fire gun

					fireGun(playerID, contros[playerID].rightStick.bearing, rayDistance);

					roster[playerID].targRay.remove();
				}
			}
		}

		if (contros[playerID].lt > 0.2) {
			roster[playerID].obj.rotationSpeed -= 0.001 * contros[playerID].lt;
		}
		if (contros[playerID].rt > 0.2) {
			roster[playerID].obj.rotationSpeed += 0.001 * contros[playerID].rt;
		}
		if (contros[playerID].leftStick.y < -0.2) {
			roster[playerID].obj.bearing = roster[playerID].obj.rotation;
			roster[playerID].obj.applyForce(-11 * contros[playerID].leftStick.y);
		}
		if (contros[playerID].leftStick.y > 0.2) {
			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 180;
			roster[playerID].obj.applyForce(6 * contros[playerID].leftStick.y);
		}
		if (contros[playerID].leftStick.x > 0.2) {
			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 90;
			roster[playerID].obj.applyForce(2 * contros[playerID].leftStick.x);
		}
		if (contros[playerID].leftStick.x < -0.2) {
			roster[playerID].obj.bearing = roster[playerID].obj.rotation + 270;
			roster[playerID].obj.applyForce(-2 * contros[playerID].leftStick.x);
		}

		//track state for next frame
		if (contros[playerID].r >= 1) {
			roster[playerID].prevFramePressedRB = true;
		} else {
			roster[playerID].prevFramePressedRB = false;
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

function uiHandler(user) 
{
	// only pass interactables

	healthIndicator(user)
	miniMap(user);
	debugStats(user)
}

function debugStats(user)
{
	//debug stats
	push()
	fill(255)
	text("Health: " + user.health, 10, 10)
	text("Value: " + user.value, 10, 20)
	
	//text("Rotation: " + user.rotation, 10, 40)
	
	pop() 
}


function healthIndicator(user)
{
	
	push()
	let location =  //determine circle location
	{
		x: user.vel.x * -3,
		y: user.vel.y * -3
	} 

	//find arc angle 
	let hpMax = user.maxHealth
	let hp = user.health
	let arcAngle = (hp * 360)/hpMax
	//
	user.rotation %= 360;
	//determine start angle
	let startAngle = user.rotation - (arcAngle/2)
	if (startAngle < 0){startAngle+=360}
	//determine end angle
	let endAngle = startAngle + arcAngle - 0.0000001
	if (endAngle > 360){endAngle-=360}

	//draw arc
	stroke(255,0,0)
	noFill()
	arc((width/2)-(location.x), (height/2)-(location.y), 100, 100, startAngle, endAngle)
	//text("Arc: " + [(width/2)-(location.x), (height/2)-(location.y), 100, 100, startAngle, endAngle], 10, 260)
	pop()

}


function miniMap(user) {
	push();
	mini.x = 120;
	mini.y = 120;
	vectorTo = {};
	vectorTo.x = -user.x; //finds xy vector to the core from the user
	vectorTo.y = -user.y;
	let dist = findRadius(vectorTo.x, vectorTo.y);

	stroke("white");
	fill("#03004090");

	circle(mini.x, mini.y, 2 * (75 + bufferRadius / 250) + 25);
	stroke("#030040");
	fill("#030040");
	ellipse(mini.x, mini.y, 150, 150);

	stroke("white");
	fill("white");


	if (findRadius(vectorTo.x, vectorTo.y) < playerHorizon) {
		ellipse(
			mini.x + (vectorTo.x / playerHorizon) * 75,
			mini.y + (vectorTo.y / playerHorizon) * 75,
			10,
			10
			
		);
	} else {
		let angle = findBearing(vectorTo.x, vectorTo.y);
		let pointerStart = calculateBearingLineEnd(angle, 75),
			pointerEnd = calculateBearingLineEnd(
				angle,
				75 + (dist / bufferRadius) * 25


			);
		line(
			mini.x + pointerStart.x,
			mini.y + pointerStart.y,
			mini.x + pointerEnd.x,
			mini.y + pointerEnd.y

		);
	}
	push();
	translate(mini.x, mini.y);
	rotate(user.rotation - 90);
	fill("#030040");
	stroke("white");
	triangle(0, 4, 2, -4, -2, -4);
	pop();
	for (i of asteroidNodes) { // MAPS ASTEROID nodes
		vectorTo.x = i.x - user.x; //finds xy vector to the object from the user
		vectorTo.y = i.y - user.y;
		if (findRadius(vectorTo.x, vectorTo.y) < playerHorizon) {
			ellipse(
				mini.x + (vectorTo.x / playerHorizon) * 75,
				mini.y + (vectorTo.y / playerHorizon) * 75,
				1,
				1
			);
		} else {
			let angle = findBearing(vectorTo.x, vectorTo.y);
			let pointerStart = calculateBearingLineEnd(angle, 75);
			fill("white");
			stroke("white");
			circle(mini.x + pointerStart.x, mini.y + pointerStart.y, 1);
		}
	}

	pop();
}

function keyPressed() {
	ctrl(0);// runs the control function for the first player in roster
}

function draw() {
	clear();
	// interactables.update();    broken solution 

	background(0);
	enforceBorders();
	keyPressed();
	runTorp();
	detectCollision();
	detectDeath();
	maintainAsteroids()
	drillCollection()

	
	followCamera(roster[0].obj);

	push()
	//Mimic p5.play's normal camera functionality
	translate(-camera.x + width/2, -camera.y + height/2)
	//Draw all sprites with the offset
	allSprites.draw()
	pop()
	//Draw UI without the offset
	uiHandler(roster[0].obj);

}
