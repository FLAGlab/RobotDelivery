const fs = require('fs')
const cli = require("cli-color")
const { inherits } = require('util')

let data = fs.readFileSync('tests/maps/maps_10.json')
//let data = fs.readFileSync('tests/maps/maps_26.json')
let map_data = JSON.parse(data)
let dimension = map_data.dimension
let map = buildMap(map_data, init([dimension, dimension]))
//print(map)

function init(dim) {
    var arr = []
    for(var i=0; i<dim[0]; ++i) {
        arr.push(dim.length == 1? 0 : init(dim.slice(1)))
    }
    return arr
}

function buildMap(map, arr) {
    let blocks = map.blocks
    for(var b in blocks) {
        var block = blocks[b]
        for(var i=block.x; i< block.x + block.height; ++i)
            for(var j=block.y; j<block.y+block.width; ++j) {
                arr[i][j] = 1
            }
    }
    for(d in map.doors) {
        var door = map.doors[d]
        arr[door.x][door.y] = 2
    }
    arr[map.base.x][map.base.y] = 3
    //arr[map.robot.x][map.robot.y] = "R"
    return arr
}

function print(map, robotX, robotY) {
    console.log("MAP:")
    for(var i=0; i<map.length; i++) {
        line = ""
        for(var j=0; j<map.length; j++) {
            if(map[i][j] == 1)
                line += cli.red(` ${map[i][j]} `)
            else if(map[i][j] == 2)
                line += cli.green(` ${map[i][j]} `)
            else if(map[i][j] == 3)
                line += cli.blue(` ${map[i][j]} `)
            else if(i == robotX && j == robotY)
                line += cli.cyan(` R `)
            else
                line += ` ${map[i][j]} `
        }
        console.log(line)
    }
}

exports.map = map
exports.printMap = print
exports.base = [map_data.base.x, map_data.base.y],
exports.robot = [map_data.robot.x, map_data.robot.y]
