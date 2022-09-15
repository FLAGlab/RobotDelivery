const robot = require("../environment/Robot");

function init(dimension) {
    let accounts = new Array(dimension)
    accounts.fill(new Array(dimension).fill(0))
}

function chooseRandomAction(r) {
    const methods = getMethods(r)
    let rand = Math.floor(Math.random() * Math.floor(methods.length)) 
    if(methods[rand] == 'turn') 
        if (Math.random() < 0.5) r[methods[rand]]('r'); else r[methods[rand]]('l')
    else 
        r[methods[rand]]()
    return methods[rand]
}

function chooseAction(r, p) {
    switch(r.direction) {
        case 0: 
            if(r.posX < p[0]) {
                robot.moveBack()
                return 'moveBack'
            } else if(r.posX == p[0] && r.posY > p[1]) {
                r.turn('l')
                return 'turn'
            } else if(r.posX > p[0]) {
                r.moveForward()
                return 'moveForward'
            } else if(r.posX == p[0] && r.posY < p[1]) {
                r.turn('r')
                return 'turn'
            }
            break
        case 180: 
            if(r.posX < p[0]) {
                robot.moveForward()
                return 'moveForward'
            } else if(r.posX == p[0] && r.posY < p[1]) {
                r.turn('l')
                return 'turn'
            } else if(r.posX > p[0]) {
                r.moveBack()
                return 'moveForward'
            } else if(r.posX == p[0] && r.posY > p[1]) {
                r.turn('r')
                return 'turn'
            }
            break
        case 90: 
            if(r.posY < p[1]) {
                robot.moveForward()
                return 'moveForward'
            } else if(r.posY == p[1] && r.posX < p[0]) {
                r.turn('r')
                return 'turn'
            } else if(r.posY > p[1]) {
                r.moveBack()
                return 'moveForward'
            } else if(r.posY == p[1] && r.posX > p[1]) {
                r.turn('l')
                return 'turn'
            }
            break
        case 270: 
            if(r.posY < p[1]) {
                robot.moveBack()
                return 'moveForward'
            } else if(r.posY == p[1] && r.posX < p[0]) {
                r.turn('l')
                return 'turn'
            } else if(r.posY > p[1]) {
                r.moveForward()
                return 'moveForward'
            } else if(r.posY == p[1] && r.posX > p[1]) {
                r.turn('r')
                return 'turn'
            }
            break
    }
}

function Agent(dimension) {
    qtable: init(dimension)
}

Agent.prototype.action = function(robot) {
    let max = 0
    let pos = []
    for(var i=robot.posX-1; i<=robot.posX+1; ++i) {
        for(var j=robot.posY-1; j<=robot.posY+1; ++j)
            if(max < qtable[i][j]) {
                max = qtable[i][j]
                pos = [i, j]
            }
    }
    if(max == 0)
       return chooseRandomAction(robot)
    else 
        return chooseAction(robot, pos)
}

Agent.prototype.update = function(oldState, newState, action, reward) {
    continue
}

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => 
    typeof obj[item] === 'function' && (item == 'turn' || item == 'moveForward' || item == 'moveBack' || item == 'stop'))

module.exports = Agent