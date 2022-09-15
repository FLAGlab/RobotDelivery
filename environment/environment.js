const Agent = require("./agent.js")
const QLearning = require("./qlearning.js")
const fs = require('fs')
/* 
 * environment definition
 */
function World() {
    this.maxX = 5
    this.maxY = 5
    this.points = [[0,0], [0,4], [4,0], [4,3]]
    this.passenger = this.definePassenger()
}

World.prototype.definePassenger = function() {
    let startx = -1 
    let starty = -1 
    let endx = -1 
    let endy = -1
    while([startx, starty].every((val,index) => val === [endx, endy][index])) {
        let point = this.points[randInt(0, this.points.length-1)]
        startx = point[0]
        starty = point[1]
        point = this.points[randInt(0, this.points.length-1)]
        endx = point[0]
        endy = point[1]
    }
    return [startx, starty, endx, endy]
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function main() {
    w = new World()
    let p = w.passenger 
    agent = new Agent(w)
    console.log(agent.actions)
    learner = new QLearning(agent)
    let data = ""
    for(let i=0; i<10; i++) {
        w.passenger = p
        data = `START = [${p[0]}, ${p[1]}] \n`
        data += `GOAL = [${p[2]}, ${p[3]}]\n`
        data += learner.run()
        fs.writeFile(`./run${i+1}.csv`, data, function (err,data) {
            if (err) {
              return console.log(err);
            }
            console.log(data)})
    }
    fs.writeFile('./qtable.txt', learner.qtable.toString(), function (err,data) {
        if (err) {
          return console.log(err);
        }
        console.log(data)})
}
main()