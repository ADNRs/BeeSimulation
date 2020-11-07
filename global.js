let WIDTH
let HEIGHT
let DEPTH
let HIVE_POSITION
let PREDATOR_POSITION

let BG_COLOR = [0x07, 0x00, 0x0E]
let AXIS_COLOR = [0xF0, 0x8B, 0x33]
let BEE_COLOR = [0xF2, 0xA1, 0x04]
let FOOD_COLOR = [0xFF, 0xFF, 0xFF]
let PREDATOR_COLOR = [0xFF, 0x00, 0x00]
let HIVE_COLOR = [0xD7, 0x54, 0x04]

let NUM_BEES = 1
let NUM_FOODS = 80
let NUM_PREDATOR = 10

let PREDATOR_COND = 300
let PREDATOR_KILL_INTERVAL = 1
let PREDATOR_RESPAWN_INTERVAL = 300

let LIFE_BEE = 1500
let LIFE_FOOD = 10
let LIFE_PREDATOR = 3000

let FOOD_REGEN_PROB = 0.01

let STORED_FOOD = 0
let NEW_BEE_COST = 1

let VEL_LIMIT = 8 // limit of velocity
let SEP_MULTIPLIER = 0.07
let ALI_MULTIPLIER = 0.07
let COH_MULTIPLIER = 0.07
let SEN_MULTIPLIER = 0.1
let WAN_MULTIPLIER = 0.25
let ATK_MULTIPLIER = 0.8

let PRE_COH_MULTIPLIER = 0.5

let NEIGHBOR_DIST = 100
let NEIGHBOR_ANGLE = 120
let SENSE_DIST = 200
let CHECK_DIST = 20
let ATK_DIST = 1500

let currBees
let prevBees
let currFoods
let currPredators
let currKillInterval = 0
let currRespawnInterval = 0
