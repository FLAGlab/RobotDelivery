const Trait = require("./../../vendor/traits.js").Trait

PackageBehavior = Trait({
    weight: function() {
        return this.weight
    }
})

function package(nw, sx, sy, dx, dy) {
    return Object.create(Object.prototype,
        Trait.compose(PackageBehavior,
            Trait({
                w: nw,
                location: [sx, sy],
                destination: [dx, dy],
            })
        )
    )
}

module.exports = package