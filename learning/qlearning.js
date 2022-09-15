/*
 * Implementation of the Q-learning algorithm
 */

function QLearning(agent, alpha=0.1, gamma=0.6, epsilon=0.1) {
   this.alpha = alpha
   this.gamma = gamma
   this.epsilon = epsilon
   this.agent = agent
   this.actions = agent.actions
   //The current state is a tuple gathered from the agent
   this.currentState = agent._getState()
   this.qtable = initQTable(this.actions)
}

QLearning.prototype.randomAction = function() {
    return randInt(0, this.actions.length - 1)
}

QLearning.prototype.run = function() {
    let done = false
    let action = -1
    let data = ""
    let penalties=0
    while(!done) {
        if(Math.random() < this.epsilon)
            action = this.randomAction()
        else {
            action = this.qtable[this.currentState.toString()].map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1]
            console.log("rewarded action")
            //action = Math.max.apply(Math, this.qtable[this.currentState.toString()])
        }
        console.log(action)
        //result = [next_sate, reward, donde, info]
        result = this.step(action)
        oldValue = this.qtable[this.currentState][action]
        nextMax = Math.max.apply(Math, this.qtable[result[0]])
        newValue = (1- this.alpha)*oldValue + this.alpha*(result[1] + this.gamma*nextMax)
        this.qtable[this.currentState][action] = newValue
        
        console.log(result[3])
        //print to file
        data += `${this.currentState}, ${action}, ${result[0]}, p=${penalties}\n`
        if(result[1] == -10)
            penalties++
        this.currentState = result[0]
        done = result[2]
    }
    return data
}

QLearning.prototype.step = function(action) {
    //reward_done = [reward, done]
    let reward_done = this.getRewards(this.currentState, action)
    eval(`this.agent.${this.actions[action]}()`)
    next_state = [this.agent.x, this.agent.y, isNaN(this.agent.passenger)]
    info = `Executed action: ${this.actions[action]} at state ${this.currentState}`
    return [next_state, reward_done[0], reward_done[1], info]
}

/*change function */
QLearning.prototype.getRewards = function(state, action) {
    let p =  this.agent.passenger 
    let worldPassenger = this.agent.world.passenger
    if(!p && [this.agent.x, this.agent.y].every((val, i) => val == [worldPassenger[2], worldPassenger[3]][i]))
        return [20, true]
    else if(isNaN(p) && action == 'pickup' && [this.agent.x, this.agent.y].every((val, i) => val === [worldPassenger[0], worldPassenger[1]][i]))
        return [5, false]
    else if(action == 'pickup' && ![this.agent.x, this.agent.y].every((val, i) => val === [worldPassenger[0], worldPassenger[1]][i]))
        return [10, false]
    else if(action == 'dropoff' && ![this.agent.x, this.agent.y].every((val, i) => val === [worldPassenger[2], worldPassenger[3]][i]))
        return [-10, false]
    else
        return [-1, false]
}

/*change function */
function initQTable(actions) {
    table = {}
    var i =0
    var leni = 5//this.agent.world.maxX
    while(i < leni) {
        var j = 0 
        var lenj = 5//this.agent.world.maxY
        while(j < lenj) {
            table[[i,j,true]] = new Array(actions.length).fill(0)
            table[[i,j,false]] = new Array(actions.length).fill(0)
            j ++
        }
        i++
    }
    return table
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

module.exports = QLearning