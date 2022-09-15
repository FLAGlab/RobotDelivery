const Trait = require("./../../vendor/traits.js").Trait

const directions = {
    N: 0,
    E: 90,
    S: 180,
    W: 270
}

RobotBehavior = Trait({
    moveForward: function() {
       // console.log("Moving ->")
        switch(this.direction) {
            case directions.N: 
                if(this.world[this.posX-1][this.posY] == 0 && this.posX-1 >= 0)
                    this.posX -= 1
                break
            case directions.S: 
                if(this.world[this.posX+1][this.posY] == 0 && this.posX+1 < this.world.length)
                    this.posX += 1
                break
            case directions.E: 
                if(this.world[this.posX][this.posY+1] == 0 && this.posY+1 < this.world.length)
                    this.posY += 1;
                break
            case directions.W: 
                if(this.world[this.posX][this.posY-1] == 0 && this.posY-1 >= 0)
                    this.posY -= 1;
                break
        }
    },

    moveBack: function() {
        //console.log("Moving <-")
        switch(this.direction) {
            case directions.N: 
                if(this.world[this.posX+1][this.posY] == 0 && this.posX+1 < this.world.length)
                    this.posX += 1
                break
            case directions.S: 
                if(this.world[this.posX-1][this.posY] == 0 && this.posX-1 >= 0)
                    this.posX -= 1
                break
            case directions.E: 
                if(this.world[this.posX][this.posY-1] == 0 && this.posY-1 >= 0)
                    this.posY -= 1;
                break
            case directions.W: 
                if(this.world[this.posX][this.posY+1] == 0 && this.posY+1 < this.world.length)
                    this.posY += 1;
                break
        }
    },

    turn: function(dir) {
        if(dir == 'r')
            this.direction += 90 
        else
            this.direction -= 90 
    },

    stop : function() {
        //do nothing
    },

    pickUp: function(package) {
        if(package.weight > this.load)
            largePickUp(package)
        else
            this.load -= package.weight()
        this.getDestination(package.destination)
    },
    largePickUp: function(package) {
        if(this.car)
            this.carLoad -= package.weight()
        else {
            this.findCar()
            largePickUp(package)
        }
        this.getDestination(package.destination)
    },
    putDown: function(package) {
        this.load += package.weight()
        this.destination = []
    },
    largePutDown: function(package) {
        this.carLoad += package.weight()
        this.destination = []
    },
    findCar: function() {
        this.destination = [this.base.posX, this.base.posY]
    },
    getDestination: function(dest) {
        this.destination = dest
    },
    getState: function() {
        return {
            pos: [this.posX, this.posY],
            direction: this.direction,
            load: 10.0 - this.load,
            car: this.car,
            laod: 30 - this.carLoad
        }
    }
})

function robot(x, y, b, map) {
    return Object.create(Object.prototype,
        Trait.compose(RobotBehavior,
            Trait({
                posX: x,
                posY: y,
                direction: directions.N,
                load: 10.0,
                car: false,
                carLoad: 30.0,
                destination: [],
                base: b,
                world: map
            })
        )
    )
}

module.exports = robot