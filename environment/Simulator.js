const Trait = require("./../../vendor/traits.js").Trait
const MapData = require("./../data/read_map.js")
const Base = require("./Base.js")
const Robot = require("./Robot.js")
const Package = require("./Package.js")
//const RandomAgent = require("./../learning/RandomAgent.js")
//const AccountantAgent = require("./../learning/AccountantAgent.js")
const RL = require("./../learning/rlAgent.js")

const map = MapData.map
const base = Base(MapData.base[0], MapData.base[1])
const robot = Robot(MapData.robot[0], MapData.robot[1], base, map)
//const randomAgent = new RandomAgent()
//const accountantAgent = new AccountantAgent(map.length)
const rlAgent = new RL(robot)

console.log("  Start:")
simulate()

function simulate() {
    const p = Package(1,robot.posX, robot.posY, 3, 7)
    robot.pickUp(p)
    let state = [robot.posX, robot.posY]
    console.log(state)
    let r = 0
    let a = ""
    while(r != 100) {
        a, r = rlAgent.action()
        //randomAgent.update(state, [robot.posX, robot.posY], a, r)
        //accountantAgent.update(state, [robot.posX, robot.posY], a, r)
        state = [robot.posX, robot.posY]
        r = 100
        //console.log(`[${robot.posX} , ${robot.posY}] \n`)
    }
    console.log(`[${robot.posX} , ${robot.posY}] \n`)
    console.log("--- REACHED DESTINATION --- \n")    
    drawMap()
}

function drawMap() {
    MapData.printMap(map, robot.posX, robot.posY)
}

function takeAction() {
    //let action = randomAgent.action(robot)
    let action = accountantAgent.action(robot)
    let reward = 0
    if([robot.posX, robot.posY] == robot.destination) {
        reawrd = 100
    }
    return action, reward
}
