const Trait = require("./../../vendor/traits.js").Trait


function Agent() {}

Agent.prototype.action = function(obj) {
    const methods = getMethods(obj)
    let rand = Math.floor(Math.random() * Math.floor(methods.length)) 
    if(methods[rand] == 'turn') 
        obj[methods[rand]]('r')
    else 
        obj[methods[rand]]()
    return methods[rand]
}

Agent.prototype.update = function(oldState, newState, action, reward) {
    //continue
}

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => 
    typeof obj[item] === 'function' && (item == 'turn' || item == 'moveForward' || item == 'moveBack' || item == 'stop'))

module.exports = Agent