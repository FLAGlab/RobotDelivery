const Trait = require("./../../vendor/traits.js").Trait

BaseBehavior = Trait({
    getCar: function() {
        this.car = false
    },
    returnCar: function() {
        this.car = true
    }
})

function base(x, y) {
    return Object.create(Object.prototype,
        Trait.compose(BaseBehavior,
                Trait({
                posX: x,
                posY: y,
                car: true,
            })
        )
    )
}

module.exports = base