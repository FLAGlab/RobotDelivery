const robot = require("../environment/Robot");
const QLearner = require("./qlearning.js")

function init(dimension) {
    let accounts = new Array(dimension)
    accounts.fill(new Array(dimension).fill(0))
}

function Agent(robot) {
    learner: new QLearner(0.1, 0.1, getMethods(robot))
    currentState: robot.getState()
}

Agent.prototype.action = function() {
    let action = this.learner.bestAction()
    if(!action) 
        action = this.learner.randomAction()
    
    robot[action]()
    let nextState = this.currentState()
    let reward = this.calculateRward()

    this.learner.step(currentState, nextSate, reward, action)
}

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => 
    typeof obj[item] === 'function' && (item == 'turn' || item == 'moveForward' || item == 'moveBack' || item == 'stop'))

module.exports = Agent