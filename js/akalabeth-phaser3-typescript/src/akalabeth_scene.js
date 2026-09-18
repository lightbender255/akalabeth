import Phaser from 'phaser'

export default class AkalabethScene extends Phaser.Scene {
	constructor() {
		super('akalabeth')

		// Apple II Hi-Res Graphics: 280 x 160 native
		// Scaled 2.5x -> 700 x 400, centered in 800 x 600 canvas
		this.SCALE = 2.5
		this.VIEW_X = 50
		this.VIEW_Y = 15

		this.COLOR_GREEN = 0x33ff33
		this.COLOR_WHITE = 0xffffff

		// Screen Modes: 'TEXT' (40-column full-screen) or 'GRAPHICS' (HGR with 4 lines bottom text)
		this.screenMode = 'TEXT'

		// Game States matching AKLABETH.BAS
		this.STATE_LUCKY = 'LUCKY'
		this.STATE_LEVEL = 'LEVEL'
		this.STATE_CHAR_GEN = 'CHAR_GEN'
		this.STATE_CHOOSE_CLASS = 'CHOOSE_CLASS'
		this.STATE_SHOP = 'SHOP'
		this.STATE_GEN_WORLD = 'GEN_WORLD'
		this.STATE_OVERLAND = 'OVERLAND'
		this.STATE_DUNGEON = 'DUNGEON'
		this.STATE_ATTACK = 'ATTACK'
		this.STATE_AXE_CHOICE = 'AXE_CHOICE'
		this.STATE_AMULET_CHOICE = 'AMULET_CHOICE'
		this.STATE_CASTLE_NAME = 'CASTLE_NAME'
		this.STATE_CASTLE_ADVENTURE = 'CASTLE_ADVENTURE'
		this.STATE_CASTLE_DIALOG = 'CASTLE_DIALOG'
		this.STATE_DEAD = 'DEAD'
		this.STATE_STATS_VIEW = 'STATS_VIEW'

		this.currentState = this.STATE_LUCKY

		// Variables from AKLABETH.BAS
		this.LN = 0 // Lucky Number
		this.LP = 1 // Level of Play (1-10)
		this.PN = '' // Player Name
		this.PT = 'F' // Player Type: 'F' = Fighter, 'M' = Mage
		this.TASK = 0 // Quest target: monster index (positive = active, negative = slain)
		this.LK = 0 // Accumulated hit points bonus upon leaving dungeon

		// C(0..5): HP, STR, DEX, STA, WIS, GOLD
		this.C_NAMES = [
			'HIT POINTS.....',
			'STRENGTH.......',
			'DEXTERITY......',
			'STAMINA........',
			'WISDOM.........',
			'GOLD...........'
		]
		this.C = [0, 0, 0, 0, 0, 0]

		// Equipment PW(0..5): FOOD, RAPIER, AXE, SHIELD, BOW AND ARROWS, MAGIC AMULET
		this.W_NAMES = [
			'FOOD',
			'RAPIER',
			'AXE',
			'SHIELD',
			'BOW AND ARROWS',
			'MAGIC AMULET'
		]
		this.PW = [20, 0, 0, 0, 0, 0] // Start with 20 rations of food

		// Monsters M$(1..10)
		this.M_NAMES = [
			'',
			'SKELETON',
			'THIEF',
			'GIANT RAT',
			'ORC',
			'VIPER',
			'CARRION CRAWLER',
			'GREMLIN',
			'MIMIC',
			'DAEMON',
			'BALROG'
		]

		// World Terrain TE%(0..20, 0..20)
		this.TE = Array.from({ length: 21 }, () => new Array(21).fill(0))
		// Dungeon DNG%(0..10, 0..10)
		this.DNG = Array.from({ length: 11 }, () => new Array(11).fill(0))

		// Player coordinates
		this.TX = 10
		this.TY = 10
		this.INOUT = 0 // 0 = Overland, >= 1 = Dungeon Level
		this.PX = 1
		this.PY = 1
		this.DX = 1
		this.DY = 0

		// Monsters in dungeon MZ%(1..10, 0..1): [alive, hp] & ML%(1..10, 0..1): [x, y]
		this.MZ = Array.from({ length: 11 }, () => [0, 0])
		this.ML = Array.from({ length: 11 }, () => [0, 0])

		// Buffer for typed input
		this.inputBuffer = ''

		// HGR bottom text lines
		this.hgrLine1 = ''
		this.hgrLine2 = ''
		this.shopFeedback = ''

		// Precompute perspective projection tables
		this.initPerspectiveTables()
	}

	create() {
		this.graphics = this.add.graphics()

		// Full-screen text display for 40-column TEXT mode
		this.textScreen = this.add.text(50, 30, '', {
			font: '19px Courier, monospace',
			fill: '#33ff33',
			lineSpacing: 6
		})

		// HGR 4-line bottom window (columns 1..28 for text/command, columns 30..40 for stats)
		this.hgrTextLeft1 = this.add.text(50, 430, '', {
			font: '18px Courier, monospace',
			fill: '#33ff33'
		})
		this.hgrTextLeft2 = this.add.text(50, 460, '', {
			font: '18px Courier, monospace',
			fill: '#33ff33'
		})
		this.hgrCommandPrompt = this.add.text(50, 520, '', {
			font: '18px Courier, monospace',
			fill: '#ffffff'
		})

		this.hgrFood = this.add.text(520, 430, '', {
			font: '18px Courier, monospace',
			fill: '#33ff33'
		})
		this.hgrHP = this.add.text(520, 460, '', {
			font: '18px Courier, monospace',
			fill: '#33ff33'
		})
		this.hgrGold = this.add.text(520, 490, '', {
			font: '18px Courier, monospace',
			fill: '#33ff33'
		})

		// Cursor blink timer
		this.cursorVisible = true
		this.time.addEvent({
			delay: 450,
			loop: true,
			callback: () => {
				this.cursorVisible = !this.cursorVisible
				this.renderScreen()
			}
		})

		// Keyboard event listener
		this.input.keyboard.on('keydown', (event) => this.handleKeyDown(event))

		// Check for dev mode via URL query parameter (?dev)
		const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
		if (urlParams && urlParams.has('dev')) {
			this.activateDevMode()
			return
		}

		// Start game at Lucky Number input
		this.startLuckyNumber()
	}

	activateDevMode() {
		this.isDevMode = true
		this.LN = 6 // Lucky Number: 6
		this.LP = 1 // Level: 1
		this.rollAttributes() // Roll qualities: Y
		this.C[5] = Math.max(50, this.C[5])
		this.PT = 'F' // Class: Fighter

		// Shop purchases: F (Food), S (Shield), R (Rapier)
		this.buyShopItem('F')
		this.buyShopItem('S')
		this.buyShopItem('R')

		// Q: Quit shop and launch world generation directly into overland
		this.startWorldGeneration()
	}

	initPerspectiveTables() {
		this.XX = new Array(11).fill(0)
		this.YY = new Array(11).fill(0)
		this.PER = Array.from({ length: 11 }, () => new Array(4).fill(0))
		this.CD = Array.from({ length: 11 }, () => new Array(4).fill(0))
		this.LD = Array.from({ length: 10 }, () => new Array(6).fill(0))
		this.FT = Array.from({ length: 10 }, () => new Array(6).fill(0))
		this.LAD = Array.from({ length: 10 }, () => new Array(4).fill(0))

		this.XX[0] = 139
		this.YY[0] = 79

		for (let x = 2; x <= 20; x += 2) {
			const idx = x / 2
			this.XX[idx] = Math.floor((Math.atan(1 / x) / Math.atan(1)) * 140 + 0.5)
			this.YY[idx] = Math.floor((this.XX[idx] * 4) / 7)
			this.PER[idx][0] = 139 - this.XX[idx]
			this.PER[idx][1] = 139 + this.XX[idx]
			this.PER[idx][2] = 79 - this.YY[idx]
			this.PER[idx][3] = 79 + this.YY[idx]
		}

		this.PER[0][0] = 0
		this.PER[0][1] = 279
		this.PER[0][2] = 0
		this.PER[0][3] = 159

		for (let x = 1; x <= 10; x++) {
			this.CD[x][0] = 139 - this.XX[x] / 3
			this.CD[x][1] = 139 + this.XX[x] / 3
			this.CD[x][2] = 79 - this.YY[x] * 0.7
			this.CD[x][3] = 79 + this.YY[x]
		}

		for (let x = 0; x < 10; x++) {
			this.LD[x][0] = (this.PER[x][0] * 2 + this.PER[x + 1][0]) / 3
			this.LD[x][1] = (this.PER[x][0] + 2 * this.PER[x + 1][0]) / 3
			const w = this.LD[x][0] - this.PER[x][0]
			this.LD[x][2] = this.PER[x][2] + (w * 4) / 7
			this.LD[x][3] = this.PER[x][2] + (2 * w * 4) / 7
			this.LD[x][4] = (this.PER[x][3] * 2 + this.PER[x + 1][3]) / 3
			this.LD[x][5] = (this.PER[x][3] + 2 * this.PER[x + 1][3]) / 3
			this.LD[x][2] = this.LD[x][4] - (this.LD[x][4] - this.LD[x][2]) * 0.8
			this.LD[x][3] = this.LD[x][5] - (this.LD[x][5] - this.LD[x][3]) * 0.8
			if (this.LD[x][3] === this.LD[x][4]) {
				this.LD[x][3] -= 1
			}

			this.FT[x][0] = 139 - this.XX[x] / 3
			this.FT[x][1] = 139 + this.XX[x] / 3
			this.FT[x][2] = 139 - this.XX[x + 1] / 3
			this.FT[x][3] = 139 + this.XX[x + 1] / 3
			this.FT[x][4] = 79 + (this.YY[x] * 2 + this.YY[x + 1]) / 3
			this.FT[x][5] = 79 + (this.YY[x] + 2 * this.YY[x + 1]) / 3

			this.LAD[x][0] = (this.FT[x][0] * 2 + this.FT[x][1]) / 3
			this.LAD[x][1] = (this.FT[x][0] + 2 * this.FT[x][1]) / 3
			this.LAD[x][3] = this.FT[x][4]
			this.LAD[x][2] = 159 - this.LAD[x][3]
		}
	}

	// Coordinate transformer: Apple II (280x160) -> Screen Viewport
	vx(x) {
		return this.VIEW_X + x * this.SCALE
	}

	vy(y) {
		return this.VIEW_Y + y * this.SCALE
	}

	setScreenMode(mode) {
		this.screenMode = mode
		if (mode === 'TEXT') {
			this.graphics.clear()
			this.textScreen.setVisible(true)
			this.hgrTextLeft1.setVisible(false)
			this.hgrTextLeft2.setVisible(false)
			this.hgrCommandPrompt.setVisible(false)
			this.hgrFood.setVisible(false)
			this.hgrHP.setVisible(false)
			this.hgrGold.setVisible(false)
		} else {
			this.textScreen.setVisible(false)
			this.hgrTextLeft1.setVisible(true)
			this.hgrTextLeft2.setVisible(true)
			this.hgrCommandPrompt.setVisible(true)
			this.hgrFood.setVisible(true)
			this.hgrHP.setVisible(true)
			this.hgrGold.setVisible(true)
		}
	}

	startLuckyNumber() {
		this.setScreenMode('TEXT')
		this.currentState = this.STATE_LUCKY
		this.inputBuffer = ''
		this.renderScreen()
	}

	rollAttributes() {
		// 3640 FOR X = 0 TO 5: C(X) = INT(SQR(RND(1)) * 21 + 4): NEXT X
		for (let i = 0; i < 6; i++) {
			this.C[i] = Math.floor(Math.sqrt(Math.random()) * 21 + 4)
		}
		// Ensure starting HP and food are sufficient for adventure
		this.C[0] = Math.max(10, this.C[0])
		if (this.PW[0] < 20) {
			this.PW[0] = 20
		}
		this.currentState = this.STATE_CHAR_GEN
		this.renderScreen()
	}

	openAdventureShop() {
		this.setScreenMode('TEXT')
		this.currentState = this.STATE_SHOP
		this.shopFeedback = ''
		this.renderScreen()
	}

	buyShopItem(letter) {
		let z = -1
		let p = 0

		if (letter === 'F') {
			z = 0
			p = 1
		} else if (letter === 'R') {
			z = 1
			p = 8
		} else if (letter === 'A') {
			z = 2
			p = 5
		} else if (letter === 'S') {
			z = 3
			p = 6
		} else if (letter === 'B') {
			z = 4
			p = 3
		} else if (letter === 'M') {
			z = 5
			p = 15
		}

		if (z === -1) {
			this.shopFeedback = "I'M SORRY WE DON'T HAVE THAT."
			this.renderScreen()
			return
		}

		if (letter === 'R' && this.PT === 'M') {
			this.shopFeedback = "I'M SORRY MAGES CAN'T USE THAT!"
			this.renderScreen()
			return
		}

		if (letter === 'B' && this.PT === 'M') {
			this.shopFeedback = "I'M SORRY MAGES CAN'T USE THAT!"
			this.renderScreen()
			return
		}

		if (this.C[5] - p < 0) {
			this.shopFeedback = "M'LORD THOU CAN NOT AFFORD THAT ITEM."
			this.renderScreen()
			return
		}

		// Purchase item
		if (z === 0) {
			this.PW[0] += 10
		} else {
			this.PW[z] += 1
		}
		this.C[5] -= p
		this.shopFeedback = `${this.W_NAMES[z]}`
		this.renderScreen()
	}

	startWorldGeneration() {
		this.setScreenMode('TEXT')
		this.currentState = this.STATE_GEN_WORLD
		this.generateWorld()

		let dots = ''
		let count = 0
		this.time.addEvent({
			delay: 200,
			repeat: 6,
			callback: () => {
				dots += '.'
				count++
				this.textScreen.setText([
					'',
					'',
					'',
					'',
					' WELCOME TO AKALABETH, WORLD OF DOOM!',
					'',
					'',
					'',
					'',
					'',
					` (PLEASE WAIT)${dots}`
				].join('\n'))

				if (count >= 6) {
					this.time.delayedCall(300, () => {
						this.enterOverland()
					})
				}
			}
		})
	}

	enterOverland() {
		this.setScreenMode('GRAPHICS')
		this.INOUT = 0
		this.currentState = this.STATE_OVERLAND
		this.hgrLine1 = ''
		this.hgrLine2 = ''
		this.drawOverland()
		this.updateHGRText()
	}

	enterDungeon() {
		this.setScreenMode('GRAPHICS')
		this.INOUT = 1
		this.PX = 1
		this.PY = 1
		this.DX = 1
		this.DY = 0
		this.generateDungeonLevel(1)
		this.currentState = this.STATE_DUNGEON
		this.hgrLine1 = 'GO DUNGEON'
		this.hgrLine2 = 'PLEASE WAIT'
		this.drawDungeon()
		this.updateHGRText()
	}

	leaveDungeon() {
		this.INOUT = 0
		this.currentState = this.STATE_OVERLAND
		this.hgrLine1 = 'LEAVE DUNGEON'
		if (this.LK > 0) {
			this.C[0] += this.LK
			this.hgrLine2 = `THOU HAST GAINED ${this.LK} HIT POINTS`
			this.LK = 0
		} else {
			this.hgrLine2 = ''
		}
		this.drawOverland()
		this.updateHGRText()
	}

	generateWorld() {
		for (let x = 0; x <= 20; x++) {
			this.TE[x][0] = 1
			this.TE[0][x] = 1
			this.TE[x][20] = 1
			this.TE[20][x] = 1
		}

		for (let x = 1; x <= 19; x++) {
			for (let y = 1; y <= 19; y++) {
				let t = Math.floor(Math.pow(Math.random(), 5) * 4.5)
				if (t === 3 && Math.random() > 0.5) t = 0
				this.TE[x][y] = t
			}
		}

		// Lord British Castle (5)
		const cx = Math.floor(Math.random() * 19 + 1)
		const cy = Math.floor(Math.random() * 19 + 1)
		this.TE[cx][cy] = 5

		// Starting town (3)
		this.TX = Math.floor(Math.random() * 19 + 1)
		this.TY = Math.floor(Math.random() * 19 + 1)
		this.TE[this.TX][this.TY] = 3

		// Ensure several dungeons (4)
		for (let i = 0; i < 4; i++) {
			const dx = Math.floor(Math.random() * 19 + 1)
			const dy = Math.floor(Math.random() * 19 + 1)
			if (this.TE[dx][dy] === 0) this.TE[dx][dy] = 4
		}
	}

	generateDungeonLevel(level) {
		this.INOUT = level
		for (let x = 1; x <= 9; x++) {
			for (let y = 1; y <= 9; y++) {
				this.DNG[x][y] = 0
			}
		}

		for (let x = 0; x <= 10; x++) {
			this.DNG[x][0] = 1
			this.DNG[x][10] = 1
			this.DNG[0][x] = 1
			this.DNG[10][x] = 1
		}

		for (let x = 2; x <= 8; x += 2) {
			for (let y = 1; y <= 9; y++) {
				this.DNG[x][y] = 1
				this.DNG[y][x] = 1
			}
		}

		for (let x = 2; x <= 8; x += 2) {
			for (let y = 1; y <= 9; y += 2) {
				if (Math.random() > 0.95) this.DNG[x][y] = 2 // Trap
				if (Math.random() > 0.95) this.DNG[y][x] = 2
				if (Math.random() > 0.6) this.DNG[y][x] = 3 // Secret Door
				if (Math.random() > 0.6) this.DNG[x][y] = 3
				if (Math.random() > 0.6) this.DNG[x][y] = 4 // Door
				if (Math.random() > 0.6) this.DNG[y][x] = 4
				if (Math.random() > 0.97) this.DNG[y][x] = 9 // Ladder Dn
				if (Math.random() > 0.97) this.DNG[x][y] = 9
				if (Math.random() > 0.94) this.DNG[x][y] = 5 // Chest
				if (Math.random() > 0.94) this.DNG[y][x] = 5
			}
		}

		this.DNG[2][1] = 0
		if (this.INOUT % 2 === 0) {
			this.DNG[7][3] = 7 // Ladder down
			this.DNG[3][7] = 8 // Ladder up
		} else {
			this.DNG[7][3] = 8
			this.DNG[3][7] = 7
		}

		if (this.INOUT === 1) {
			this.DNG[1][1] = 8 // Exit to surface
			this.DNG[7][3] = 0
		}

		this.spawnMonsters()
	}

	spawnMonsters() {
		for (let m = 1; m <= 10; m++) {
			this.MZ[m][0] = 0
			this.MZ[m][1] = m + 3 + this.INOUT
			if (m - 2 <= this.INOUT && Math.random() <= 0.4) {
				let mx = Math.floor(Math.random() * 9 + 1)
				let my = Math.floor(Math.random() * 9 + 1)
				let attempts = 0
				while (
					(this.DNG[mx][my] !== 0 || (mx === this.PX && my === this.PY)) &&
					attempts < 20
				) {
					mx = Math.floor(Math.random() * 9 + 1)
					my = Math.floor(Math.random() * 9 + 1)
					attempts++
				}
				if (this.DNG[mx][my] === 0) {
					this.DNG[mx][my] = m * 10
					this.MZ[m][0] = 1
					this.ML[m][0] = mx
					this.ML[m][1] = my
					this.MZ[m][1] = m * 2 + this.INOUT * 2 * this.LP
				}
			}
		}
	}

	drawOverland() {
		this.graphics.clear()

		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				const mapX = this.TX + x
				const mapY = this.TY + y
				if (mapX < 0 || mapX > 20 || mapY < 0 || mapY > 20) continue

				const zz = this.TE[mapX][mapY]
				const x1 = 65 + (x + 1) * 50
				const y1 = (y + 1) * 50

				if (zz === 1) {
					// Mountains (Apple II modular mountain tile)
					this.graphics.lineStyle(2, this.COLOR_GREEN, 1)
					this.graphics.beginPath()
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 50))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 50))

					this.graphics.moveTo(this.vx(x1), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 10))
					this.graphics.moveTo(this.vx(x1 + 50), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 10))
					this.graphics.moveTo(this.vx(x1), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 40))
					this.graphics.moveTo(this.vx(x1 + 40), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 50), this.vy(y1 + 40))

					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 20))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 20))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 30), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 30), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1))
					this.graphics.strokePath()
				} else if (zz === 2) {
					// Feature / Forest
					this.graphics.lineStyle(2, this.COLOR_GREEN, 1)
					this.graphics.strokeRect(
						this.vx(x1 + 18),
						this.vy(y1 + 18),
						14 * this.SCALE,
						14 * this.SCALE
					)
				} else if (zz === 3) {
					// Town icon matching authentic Apple II HGR artifacting
					// Horizontal lines (White in Apple II color artifacting)
					this.graphics.lineStyle(2, this.COLOR_WHITE, 1)
					this.graphics.beginPath()
					// Top horizontal caps
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 10))
					this.graphics.moveTo(this.vx(x1 + 30), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 10))

					// Upper continuous crossbar
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 20))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 20))

					// Lower continuous crossbar
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 30))

					// Bottom horizontal caps
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 40))
					this.graphics.moveTo(this.vx(x1 + 30), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 40))
					this.graphics.strokePath()

					// Vertical lines (Green in Apple II color artifacting)
					this.graphics.lineStyle(2, this.COLOR_GREEN, 1)
					this.graphics.beginPath()
					// Outer left verticals
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 20))
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 10), this.vy(y1 + 40))

					// Inner vertical continuous lines
					this.graphics.moveTo(this.vx(x1 + 20), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 20), this.vy(y1 + 40))
					this.graphics.moveTo(this.vx(x1 + 30), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 30), this.vy(y1 + 40))

					// Outer right verticals
					this.graphics.moveTo(this.vx(x1 + 40), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 20))
					this.graphics.moveTo(this.vx(x1 + 40), this.vy(y1 + 30))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 40))
					this.graphics.strokePath()
				} else if (zz === 4) {
					// Dungeon entrance: centered 'X' (as shown in OUTSIDE.GIF)
					this.graphics.lineStyle(2, this.COLOR_WHITE, 1)
					this.graphics.beginPath()
					this.graphics.moveTo(this.vx(x1 + 14), this.vy(y1 + 14))
					this.graphics.lineTo(this.vx(x1 + 36), this.vy(y1 + 36))
					this.graphics.moveTo(this.vx(x1 + 14), this.vy(y1 + 36))
					this.graphics.lineTo(this.vx(x1 + 36), this.vy(y1 + 14))
					this.graphics.strokePath()
				} else if (zz === 5) {
					// Castle of Lord British: outer square, inner square, inner 'X' (as shown in OUTSIDE.GIF)
					this.graphics.lineStyle(2, this.COLOR_WHITE, 1)
					this.graphics.strokeRect(
						this.vx(x1),
						this.vy(y1),
						50 * this.SCALE,
						50 * this.SCALE
					)
					this.graphics.lineStyle(2, this.COLOR_GREEN, 1)
					this.graphics.strokeRect(
						this.vx(x1 + 10),
						this.vy(y1 + 10),
						30 * this.SCALE,
						30 * this.SCALE
					)
					this.graphics.lineStyle(2, this.COLOR_WHITE, 1)
					this.graphics.beginPath()
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 10))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 40))
					this.graphics.moveTo(this.vx(x1 + 10), this.vy(y1 + 40))
					this.graphics.lineTo(this.vx(x1 + 40), this.vy(y1 + 10))
					this.graphics.strokePath()
				}
			}
		}

		// Draw Player crosshair at center (140, 75) in magenta/pink (as in OUTSIDE.GIF)
		this.graphics.lineStyle(2, 0xff44ff, 1)
		this.graphics.beginPath()
		this.graphics.moveTo(this.vx(138), this.vy(75))
		this.graphics.lineTo(this.vx(142), this.vy(75))
		this.graphics.moveTo(this.vx(140), this.vy(73))
		this.graphics.lineTo(this.vx(140), this.vy(77))
		this.graphics.strokePath()
	}

	drawDungeon() {
		this.graphics.clear()
		this.graphics.lineStyle(2, this.COLOR_GREEN, 1)

		for (let dis = 0; dis < 10; dis++) {
			const cx = this.PX + this.DX * dis
			const cy = this.PY + this.DY * dis
			const lx = this.PX + this.DX * dis + this.DY
			const ly = this.PY + this.DY * dis - this.DX
			const rx = this.PX + this.DX * dis - this.DY
			const ry = this.PY + this.DY * dis + this.DX

			const centRaw =
				cx >= 0 && cx <= 10 && cy >= 0 && cy <= 10 ? this.DNG[cx][cy] : 1
			const leftRaw =
				lx >= 0 && lx <= 10 && ly >= 0 && ly <= 10 ? this.DNG[lx][ly] : 1
			const righRaw =
				rx >= 0 && rx <= 10 && ry >= 0 && ry <= 10 ? this.DNG[rx][ry] : 1

			const l1 = this.PER[dis][0]
			const r1 = this.PER[dis][1]
			const t1 = this.PER[dis][2]
			const b1 = this.PER[dis][3]
			const l2 = this.PER[dis + 1][0]
			const r2 = this.PER[dis + 1][1]
			const t2 = this.PER[dis + 1][2]
			const b2 = this.PER[dis + 1][3]

			const mc = Math.floor(centRaw / 10)
			const cent = centRaw - mc * 10
			const left = Math.floor((leftRaw / 10 - Math.floor(leftRaw / 10)) * 10 + 0.1)
			const righ = Math.floor((righRaw / 10 - Math.floor(righRaw / 10)) * 10 + 0.1)

			if (dis > 0) {
				if (cent === 1 || cent === 3 || cent === 4) {
					// 510 Front wall rectangle
					this.graphics.strokeRect(
						this.vx(l1),
						this.vy(t1),
						(r1 - l1) * this.SCALE,
						(b1 - t1) * this.SCALE
					)

					if (cent === 4) {
						// 530 Front door
						this.graphics.beginPath()
						this.graphics.moveTo(this.vx(this.CD[dis][0]), this.vy(this.CD[dis][3]))
						this.graphics.lineTo(this.vx(this.CD[dis][0]), this.vy(this.CD[dis][2]))
						this.graphics.lineTo(this.vx(this.CD[dis][1]), this.vy(this.CD[dis][2]))
						this.graphics.lineTo(this.vx(this.CD[dis][1]), this.vy(this.CD[dis][3]))
						this.graphics.strokePath()
					}

					// 740 Check if monster at this front wall
					if (mc >= 1) {
						this.drawMonster(mc, dis)
					}

					// Solid wall or door blocks everything beyond this point - stop ray march
					break
				}
			}

			// Side walls (540, 550)
			if (left === 1 || left === 3 || left === 4) {
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(l1), this.vy(t1))
				this.graphics.lineTo(this.vx(l2), this.vy(t2))
				this.graphics.moveTo(this.vx(l1), this.vy(b1))
				this.graphics.lineTo(this.vx(l2), this.vy(b2))
				this.graphics.strokePath()
			}
			if (righ === 1 || righ === 3 || righ === 4) {
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(r1), this.vy(t1))
				this.graphics.lineTo(this.vx(r2), this.vy(t2))
				this.graphics.moveTo(this.vx(r1), this.vy(b1))
				this.graphics.lineTo(this.vx(r2), this.vy(b2))
				this.graphics.strokePath()
			}

			// Side doorways (560-590)
			if (left === 4) {
				this.graphics.beginPath()
				if (dis > 0) {
					this.graphics.moveTo(this.vx(this.LD[dis][0]), this.vy(this.LD[dis][4]))
					this.graphics.lineTo(this.vx(this.LD[dis][0]), this.vy(this.LD[dis][2]))
					this.graphics.lineTo(this.vx(this.LD[dis][1]), this.vy(this.LD[dis][3]))
					this.graphics.lineTo(this.vx(this.LD[dis][1]), this.vy(this.LD[dis][5]))
				} else {
					this.graphics.moveTo(this.vx(0), this.vy(this.LD[0][2] - 3))
					this.graphics.lineTo(this.vx(this.LD[0][1]), this.vy(this.LD[0][3]))
					this.graphics.lineTo(this.vx(this.LD[0][1]), this.vy(this.LD[0][5]))
				}
				this.graphics.strokePath()
			}
			if (righ === 4) {
				this.graphics.beginPath()
				if (dis > 0) {
					this.graphics.moveTo(this.vx(279 - this.LD[dis][0]), this.vy(this.LD[dis][4]))
					this.graphics.lineTo(this.vx(279 - this.LD[dis][0]), this.vy(this.LD[dis][2]))
					this.graphics.lineTo(this.vx(279 - this.LD[dis][1]), this.vy(this.LD[dis][3]))
					this.graphics.lineTo(this.vx(279 - this.LD[dis][1]), this.vy(this.LD[dis][5]))
				} else {
					this.graphics.moveTo(this.vx(279), this.vy(this.LD[0][2] - 3))
					this.graphics.lineTo(this.vx(279 - this.LD[0][1]), this.vy(this.LD[0][3]))
					this.graphics.lineTo(this.vx(279 - this.LD[0][1]), this.vy(this.LD[0][5]))
				}
				this.graphics.strokePath()
			}

			if (!(left === 3 || left === 1 || left === 4)) {
				if (dis !== 0) {
					this.graphics.beginPath()
					this.graphics.moveTo(this.vx(l1), this.vy(t1))
					this.graphics.lineTo(this.vx(l1), this.vy(b1))
					this.graphics.strokePath()
				}
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(l1), this.vy(t2))
				this.graphics.lineTo(this.vx(l2), this.vy(t2))
				this.graphics.lineTo(this.vx(l2), this.vy(b2))
				this.graphics.lineTo(this.vx(l1), this.vy(b2))
				this.graphics.strokePath()
			}
			if (!(righ === 3 || righ === 1 || righ === 4)) {
				if (dis !== 0) {
					this.graphics.beginPath()
					this.graphics.moveTo(this.vx(r1), this.vy(t1))
					this.graphics.lineTo(this.vx(r1), this.vy(b1))
					this.graphics.strokePath()
				}
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(r1), this.vy(t2))
				this.graphics.lineTo(this.vx(r2), this.vy(t2))
				this.graphics.lineTo(this.vx(r2), this.vy(b2))
				this.graphics.lineTo(this.vx(r1), this.vy(b2))
				this.graphics.strokePath()
			}

			if (cent === 7 || cent === 9) {
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(this.FT[dis][0]), this.vy(this.FT[dis][4]))
				this.graphics.lineTo(this.vx(this.FT[dis][2]), this.vy(this.FT[dis][5]))
				this.graphics.lineTo(this.vx(this.FT[dis][3]), this.vy(this.FT[dis][5]))
				this.graphics.lineTo(this.vx(this.FT[dis][1]), this.vy(this.FT[dis][4]))
				this.graphics.closePath()
				this.graphics.strokePath()
			}
			if (cent === 8) {
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(this.FT[dis][0]), this.vy(158 - this.FT[dis][4]))
				this.graphics.lineTo(this.vx(this.FT[dis][2]), this.vy(158 - this.FT[dis][5]))
				this.graphics.lineTo(this.vx(this.FT[dis][3]), this.vy(158 - this.FT[dis][5]))
				this.graphics.lineTo(this.vx(this.FT[dis][1]), this.vy(158 - this.FT[dis][4]))
				this.graphics.closePath()
				this.graphics.strokePath()
			}

			if (cent === 7 || cent === 8) {
				const base = this.LAD[dis][3]
				const tp = this.LAD[dis][2]
				const lx = this.LAD[dis][0]
				const rx = this.LAD[dis][1]
				this.graphics.beginPath()
				this.graphics.moveTo(this.vx(lx), this.vy(base))
				this.graphics.lineTo(this.vx(lx), this.vy(tp))
				this.graphics.moveTo(this.vx(rx), this.vy(tp))
				this.graphics.lineTo(this.vx(rx), this.vy(base))
				for (let rung = 1; rung <= 4; rung++) {
					const ry = (base * (5 - rung) + tp * rung) / 5
					this.graphics.moveTo(this.vx(lx), this.vy(ry))
					this.graphics.lineTo(this.vx(rx), this.vy(ry))
				}
				this.graphics.strokePath()
			}

			if (dis > 0 && cent === 5) {
				this.drawChest(dis)
			}

			// Monster (740-1530)
			if (mc >= 1 && dis > 0) {
				this.drawMonster(mc, dis)
			}
		}
	}

	drawChest(dis) {
		const bottom = this.PER[dis][3]
		const w = 10 / dis
		this.graphics.strokeRect(
			this.vx(139 - w),
			this.vy(bottom - w),
			2 * w * this.SCALE,
			w * this.SCALE
		)
		this.graphics.beginPath()
		this.graphics.moveTo(this.vx(139 - w), this.vy(bottom - w))
		this.graphics.lineTo(this.vx(139 - 5 / dis), this.vy(bottom - 15 / dis))
		this.graphics.lineTo(this.vx(139 + 15 / dis), this.vy(bottom - 15 / dis))
		this.graphics.lineTo(this.vx(139 + 15 / dis), this.vy(bottom - 5 / dis))
		this.graphics.lineTo(this.vx(139 + w), this.vy(bottom))
		this.graphics.strokePath()
	}

	drawMonster(mc, dis) {
		const b = 79 + this.YY[dis]
		const c = 139
		const di = dis

		this.graphics.lineStyle(2, this.COLOR_WHITE, 1)

		if (mc === 1) {
			// SKELETON
			this.graphics.beginPath()
			this.graphics.moveTo(this.vx(c - 23 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c - 15 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c - 15 / di), this.vy(b - 15 / di))
			this.graphics.lineTo(this.vx(c - 8 / di), this.vy(b - 30 / di))
			this.graphics.lineTo(this.vx(c + 8 / di), this.vy(b - 30 / di))
			this.graphics.lineTo(this.vx(c + 15 / di), this.vy(b - 15 / di))
			this.graphics.lineTo(this.vx(c + 15 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 23 / di), this.vy(b))

			this.graphics.moveTo(this.vx(c), this.vy(b - 26 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 65 / di))
			this.graphics.moveTo(this.vx(c - 5 / di), this.vy(b - 53 / di))
			this.graphics.lineTo(this.vx(c + 5 / di), this.vy(b - 53 / di))
			this.graphics.strokeCircle(this.vx(c), this.vy(b - 72 / di), (8 / di) * this.SCALE)
			this.graphics.strokePath()
		} else if (mc === 2) {
			// THIEF
			this.graphics.beginPath()
			this.graphics.moveTo(this.vx(c), this.vy(b - 56 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 8 / di))
			this.graphics.lineTo(this.vx(c + 10 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 30 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 30 / di), this.vy(b - 45 / di))
			this.graphics.lineTo(this.vx(c + 10 / di), this.vy(b - 64 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 56 / di))
			this.graphics.lineTo(this.vx(c - 10 / di), this.vy(b - 64 / di))
			this.graphics.lineTo(this.vx(c - 30 / di), this.vy(b - 45 / di))
			this.graphics.lineTo(this.vx(c - 30 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c - 10 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c), this.vy(b - 8 / di))
			this.graphics.moveTo(this.vx(c - 10 / di), this.vy(b - 64 / di))
			this.graphics.lineTo(this.vx(c - 10 / di), this.vy(b - 75 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 83 / di))
			this.graphics.lineTo(this.vx(c + 10 / di), this.vy(b - 75 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 79 / di))
			this.graphics.strokePath()
		} else if (mc === 3) {
			// GIANT RAT
			this.graphics.beginPath()
			this.graphics.moveTo(this.vx(c + 5 / di), this.vy(b - 30 / di))
			this.graphics.lineTo(this.vx(c), this.vy(b - 25 / di))
			this.graphics.lineTo(this.vx(c - 5 / di), this.vy(b - 30 / di))
			this.graphics.lineTo(this.vx(c - 15 / di), this.vy(b - 5 / di))
			this.graphics.lineTo(this.vx(c - 10 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 10 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 15 / di), this.vy(b - 5 / di))
			this.graphics.lineTo(this.vx(c + 30 / di), this.vy(b - 15 / di))
			this.graphics.strokePath()
		} else if (mc === 8) {
			// MIMIC
			this.drawChest(dis)
		} else {
			// Other monsters
			this.graphics.beginPath()
			this.graphics.moveTo(this.vx(c), this.vy(b - 75 / di))
			this.graphics.lineTo(this.vx(c - 20 / di), this.vy(b - 50 / di))
			this.graphics.lineTo(this.vx(c - 30 / di), this.vy(b - 20 / di))
			this.graphics.lineTo(this.vx(c - 15 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 15 / di), this.vy(b))
			this.graphics.lineTo(this.vx(c + 30 / di), this.vy(b - 20 / di))
			this.graphics.lineTo(this.vx(c + 20 / di), this.vy(b - 50 / di))
			this.graphics.closePath()

			this.graphics.moveTo(this.vx(c - 20 / di), this.vy(b - 50 / di))
			this.graphics.lineTo(this.vx(c - 40 / di), this.vy(b - 80 / di))
			this.graphics.lineTo(this.vx(c - 10 / di), this.vy(b - 65 / di))

			this.graphics.moveTo(this.vx(c + 20 / di), this.vy(b - 50 / di))
			this.graphics.lineTo(this.vx(c + 40 / di), this.vy(b - 80 / di))
			this.graphics.lineTo(this.vx(c + 10 / di), this.vy(b - 65 / di))
			this.graphics.strokePath()
		}

		this.graphics.lineStyle(2, this.COLOR_GREEN, 1)
	}

	updateHGRText() {
		this.hgrTextLeft1.setText(this.hgrLine1)
		this.hgrTextLeft2.setText(this.hgrLine2)

		this.hgrFood.setText(`FOOD=${Math.floor(this.PW[0])}`)
		this.hgrHP.setText(`H.P.=${Math.floor(this.C[0])}`)
		this.hgrGold.setText(`GOLD=${this.C[5]}`)

		const cursor = this.cursorVisible ? '█' : ' '
		this.hgrCommandPrompt.setText(`COMMAND? ${cursor}`)
	}

	renderScreen() {
		const cursor = this.cursorVisible ? '█' : ' '

		if (this.screenMode === 'GRAPHICS') {
			this.updateHGRText()
			return
		}

		if (this.currentState === this.STATE_LUCKY) {
			this.textScreen.setText([
				'',
				'',
				'',
				'',
				`TYPE THY LUCKY NUMBER.....${this.inputBuffer}${cursor}`,
				'',
				'  (PRESS [D] FOR DEV MODE: 6, 1, Y, F, S, R, Q)'
			].join('\n'))
		} else if (this.currentState === this.STATE_LEVEL) {
			this.textScreen.setText([
				'',
				'',
				'',
				'',
				`TYPE THY LUCKY NUMBER.....${this.LN}`,
				'',
				`LEVEL OF PLAY (1-10)......${this.inputBuffer}${cursor}`
			].join('\n'))
		} else if (this.currentState === this.STATE_CHAR_GEN) {
			const lines = ['', '', '', '', '', '', '']
			for (let i = 0; i < 6; i++) {
				lines.push(` ${this.C_NAMES[i]} ${this.C[i]}`)
			}
			lines.push('')
			lines.push(` SHALT THOU PLAY WITH THESE QUALITIES? ${cursor}`)
			this.textScreen.setText(lines.join('\n'))
		} else if (this.currentState === this.STATE_CHOOSE_CLASS) {
			const lines = ['', '', '', '', '', '', '']
			for (let i = 0; i < 6; i++) {
				lines.push(` ${this.C_NAMES[i]} ${this.C[i]}`)
			}
			lines.push('')
			lines.push(' SHALT THOU PLAY WITH THESE QUALITIES? Y')
			lines.push('')
			lines.push(` AND SHALT THOU BE A FIGHTER OR A MAGE? ${cursor}`)
			this.textScreen.setText(lines.join('\n'))
		} else if (this.currentState === this.STATE_SHOP) {
			// Exact Apple II Adventure Shop screen layout (lines 3710-3780)
			const lines = [
				'',
				'   STAT\'S       WEAPONS',
				'',
				` ${this.C_NAMES[0]} ${this.C[0].toString().padEnd(5, ' ')}  ${this.PW[0]}-${this.W_NAMES[0]}`,
				` ${this.C_NAMES[1]} ${this.C[1].toString().padEnd(5, ' ')}  ${this.PW[1]}-${this.W_NAMES[1]}`,
				` ${this.C_NAMES[2]} ${this.C[2].toString().padEnd(5, ' ')}  ${this.PW[2]}-${this.W_NAMES[2]}`,
				` ${this.C_NAMES[3]} ${this.C[3].toString().padEnd(5, ' ')}  ${this.PW[3]}-${this.W_NAMES[3]}`,
				` ${this.C_NAMES[4]} ${this.C[4].toString().padEnd(5, ' ')}  ${this.PW[4]}-${this.W_NAMES[4]}`,
				` ${this.C_NAMES[5]} ${this.C[5].toString().padEnd(5, ' ')}  ${this.PW[5]}-${this.W_NAMES[5]}`,
				'',
				'                 Q-QUIT',
				'',
				' PRICE          DAMAGE    ITEM',
				' 1 FOR 10       N/A       FOOD',
				' 8              1-10      RAPIER',
				' 5              1-5       AXE',
				' 6              1         SHIELD',
				' 3              1-4       BOW AND ARROWS',
				' 15             ?????     MAGIC AMULET',
				'',
				'WELCOME TO THE ADVENTURE SHOP',
				this.shopFeedback ? `${this.shopFeedback}` : `WHICH ITEM SHALT THOU BUY ? ${cursor}`
			]
			this.textScreen.setText(lines.join('\n'))
		} else if (this.currentState === this.STATE_STATS_VIEW) {
			const lines = [
				'',
				'   STAT\'S       WEAPONS',
				'',
				` ${this.C_NAMES[0]} ${this.C[0].toString().padEnd(5, ' ')}  ${this.PW[0]}-${this.W_NAMES[0]}`,
				` ${this.C_NAMES[1]} ${this.C[1].toString().padEnd(5, ' ')}  ${this.PW[1]}-${this.W_NAMES[1]}`,
				` ${this.C_NAMES[2]} ${this.C[2].toString().padEnd(5, ' ')}  ${this.PW[2]}-${this.W_NAMES[2]}`,
				` ${this.C_NAMES[3]} ${this.C[3].toString().padEnd(5, ' ')}  ${this.PW[3]}-${this.W_NAMES[3]}`,
				` ${this.C_NAMES[4]} ${this.C[4].toString().padEnd(5, ' ')}  ${this.PW[4]}-${this.W_NAMES[4]}`,
				` ${this.C_NAMES[5]} ${this.C[5].toString().padEnd(5, ' ')}  ${this.PW[5]}-${this.W_NAMES[5]}`,
				'',
				'                 Q-QUIT',
				'',
				' PRICE          DAMAGE    ITEM',
				' 1 FOR 10       N/A       FOOD',
				' 8              1-10      RAPIER',
				' 5              1-5       AXE',
				' 6              1         SHIELD',
				' 3              1-4       BOW AND ARROWS',
				' 15             ?????     MAGIC AMULET',
				'',
				'PRESS -CR- TO CONTINUE',
				cursor
			]
			this.textScreen.setText(lines.join('\n'))
		} else if (this.currentState === this.STATE_CASTLE_NAME) {
			this.textScreen.setText([
				'',
				'',
				'   WELCOME PEASANT INTO THE HALLS OF',
				'THE MIGHTY LORD BRITISH. HEREIN THOU MAY',
				'CHOOSE TO DARE BATTLE WITH THE EVIL',
				'CREATURES OF THE DEPTHS, FOR GREAT',
				'REWARD !',
				'',
				`WHAT IS THY NAME PEASANT ? ${this.inputBuffer}${cursor}`
			].join('\n'))
		} else if (this.currentState === this.STATE_CASTLE_ADVENTURE) {
			this.textScreen.setText([
				'',
				'',
				'   WELCOME PEASANT INTO THE HALLS OF',
				'THE MIGHTY LORD BRITISH. HEREIN THOU MAY',
				'CHOOSE TO DARE BATTLE WITH THE EVIL',
				'CREATURES OF THE DEPTHS, FOR GREAT',
				'REWARD !',
				'',
				`WHAT IS THY NAME PEASANT ? ${this.PN}`,
				'',
				`DOEST THOU WISH FOR GRAND ADVENTURE ? ${cursor}`
			].join('\n'))
		} else if (this.currentState === this.STATE_DEAD) {
			this.textScreen.setText([
				'',
				'',
				'',
				'',
				'',
				'    WE MOURN THE PASSING OF ',
				`    ${this.PN || 'THE PEASANT'} AND HIS COMPUTER`,
				'',
				' TO INVOKE A MIRACLE OF RESURRECTION',
				'       <HIT ESC KEY>'
			].join('\n'))
		}
	}

	enterCastle() {
		this.setScreenMode('TEXT')
		if (!this.PN) {
			this.currentState = this.STATE_CASTLE_NAME
			this.inputBuffer = ''
			this.renderScreen()
			return
		}

		this.currentState = this.STATE_CASTLE_DIALOG

		if (this.TASK === 0) {
			// Initial task based on wisdom: TASK = INT(C(4) / 3)
			this.TASK = Math.max(1, Math.min(10, Math.floor(this.C[4] / 3)))
			for (let i = 0; i < 6; i++) this.C[i] += 1

			this.textScreen.setText([
				'',
				'',
				'GOOD! THOU SHALT TRY TO BECOME A ',
				'KNIGHT!!!',
				'',
				'THY FIRST TASK IS TO GO INTO THE',
				'DUNGEONS AND TO RETURN ONLY AFTER',
				`KILLING A(N) ${this.M_NAMES[this.TASK]}`,
				'',
				'   GO NOW UPON THIS QUEST, AND MAY',
				'LADY LUCK BE FAIR UNTO YOU.....',
				'.....ALSO I, BRITISH, HAVE INCREASED',
				'EACH OF THY ATTRIBUTES BY ONE!',
				'',
				'     PRESS -SPACE- TO CONT.'
			].join('\n'))
		} else if (this.TASK < 0) {
			// Task completed!
			const completedMonster = Math.abs(this.TASK)
			if (completedMonster === 10) {
				this.PN = 'LORD ' + this.PN
				this.textScreen.setText([
					'',
					'',
					`   ${this.PN},`,
					'    THOU HAST PROVED THYSELF WORTHY',
					'OF KNIGHTHOOD, CONTINUE PLAY IF THOU',
					'DOTH WISH, BUT THOU HAST ACOMPLISHED',
					'THE MAIN OBJECTIVE OF THIS GAME...',
					'',
					'...CALL CALIFORNIA PACIFIC COMPUTER',
					'AT (415)-569-9126 TO REPORT THIS',
					'AMAZING FEAT!',
					'',
					'     PRESS -SPACE- TO CONT.'
				].join('\n'))
			} else {
				this.TASK = completedMonster + 1
				for (let i = 0; i < 6; i++) this.C[i] += 1
				this.textScreen.setText([
					'',
					'',
					`AAHH!!.....${this.PN}`,
					'THOU HAST ACOMPLISHED THY QUEST!',
					'UNFORTUNATELY, THIS IS NOT ENOUGH TO',
					'BECOME A KNIGHT.',
					'',
					`NOW THOU MUST KILL A(N) ${this.M_NAMES[this.TASK]}`,
					'',
					'     PRESS -SPACE- TO CONT.'
				].join('\n'))
			}
		} else {
			// Quest still pending
			this.textScreen.setText([
				'',
				'',
				`${this.PN} WHY HAST THOU RETURNED?`,
				`THOU MUST KILL A(N) ${this.M_NAMES[this.TASK]}`,
				'GO NOW AND COMPLETE THY QUEST!',
				'',
				'     PRESS -SPACE- TO CONT.'
			].join('\n'))
		}
	}

	handleKeyDown(event) {
		// Ignore browser auto-repeat for turn-based gameplay so holding a key doesn't burn all food
		if (event.repeat) {
			if (event.key !== 'Backspace') {
				return
			}
		}

		const key = event.key

		// ----------------------------------------------------
		// TEXT SCREEN MODES
		// ----------------------------------------------------
		if (this.screenMode === 'TEXT') {
			if (this.currentState === this.STATE_LUCKY) {
				const k = key.toUpperCase()
				if (k === 'D') {
					this.activateDevMode()
					return
				}
				if (key === 'Enter') {
					const val = parseInt(this.inputBuffer)
					if (!isNaN(val)) {
						this.LN = val
						this.currentState = this.STATE_LEVEL
						this.inputBuffer = ''
						this.renderScreen()
					}
				} else if (key === 'Backspace') {
					this.inputBuffer = this.inputBuffer.slice(0, -1)
					this.renderScreen()
				} else if (key.length === 1 && key >= '0' && key <= '9') {
					this.inputBuffer += key
					this.renderScreen()
				}
				return
			}

			if (this.currentState === this.STATE_LEVEL) {
				if (key === 'Enter') {
					const val = parseInt(this.inputBuffer)
					if (!isNaN(val) && val >= 1 && val <= 10) {
						this.LP = val
						this.rollAttributes()
					}
				} else if (key === 'Backspace') {
					this.inputBuffer = this.inputBuffer.slice(0, -1)
					this.renderScreen()
				} else if (key.length === 1 && key >= '0' && key <= '9') {
					this.inputBuffer += key
					this.renderScreen()
				}
				return
			}

			if (this.currentState === this.STATE_CHAR_GEN) {
				const k = key.toUpperCase()
				if (k === 'Y') {
					this.currentState = this.STATE_CHOOSE_CLASS
					this.renderScreen()
				} else if (k === 'N') {
					this.rollAttributes()
				}
				return
			}

			if (this.currentState === this.STATE_CHOOSE_CLASS) {
				const k = key.toUpperCase()
				if (k === 'F' || k === 'M') {
					this.PT = k
					this.openAdventureShop()
				}
				return
			}

			if (this.currentState === this.STATE_SHOP) {
				const k = key.toUpperCase()
				if (k === 'Q') {
					this.shopFeedback = 'BYE'
					this.renderScreen()
					this.time.delayedCall(400, () => {
						this.startWorldGeneration()
					})
				} else if (['F', 'R', 'A', 'S', 'B', 'M'].includes(k)) {
					this.buyShopItem(k)
				} else {
					this.shopFeedback = "I'M SORRY WE DON'T HAVE THAT."
					this.renderScreen()
				}
				return
			}

			if (this.currentState === this.STATE_STATS_VIEW) {
				if (key === 'Enter' || key === ' ' || key === 'Escape') {
					this.setScreenMode('GRAPHICS')
					if (this.INOUT === 0) {
						this.currentState = this.STATE_OVERLAND
						this.drawOverland()
					} else {
						this.currentState = this.STATE_DUNGEON
						this.drawDungeon()
					}
					this.updateHGRText()
				}
				return
			}

			if (this.currentState === this.STATE_CASTLE_NAME) {
				if (key === 'Enter') {
					this.PN = this.inputBuffer.trim() || 'PEASANT'
					this.currentState = this.STATE_CASTLE_ADVENTURE
					this.renderScreen()
				} else if (key === 'Backspace') {
					this.inputBuffer = this.inputBuffer.slice(0, -1)
					this.renderScreen()
				} else if (key.length === 1) {
					this.inputBuffer += key.toUpperCase()
					this.renderScreen()
				}
				return
			}

			if (this.currentState === this.STATE_CASTLE_ADVENTURE) {
				const k = key.toUpperCase()
				if (k === 'Y') {
					this.enterCastle()
				} else if (k === 'N') {
					this.PN = ''
					this.enterOverland()
				}
				return
			}

			if (this.currentState === this.STATE_CASTLE_DIALOG) {
				if (key === ' ' || key === 'Enter' || key === 'Escape') {
					this.enterOverland()
				}
				return
			}

			if (this.currentState === this.STATE_DEAD) {
				if (key === 'Escape' || key === ' ' || key === 'Enter') {
					this.PW = [20, 0, 0, 0, 0, 0]
					this.INOUT = 0
					this.TASK = 0
					this.startLuckyNumber()
				}
				return
			}
			return
		}

		// ----------------------------------------------------
		// GRAPHICS SCREEN MODES (OVERLAND & DUNGEON)
		// ----------------------------------------------------
		const k = key.toUpperCase()

		if (this.currentState === this.STATE_ATTACK) {
			this.chooseAttackWeapon(k)
			return
		}

		if (this.currentState === this.STATE_AXE_CHOICE) {
			if (k === 'T') {
				this.hgrLine1 = 'THROW'
				this.PW[2] -= 1 // Consumes an axe
				this.executeRangedAttack(5, 5)
			} else {
				this.hgrLine1 = 'SWING'
				this.executeMeleeAttack(5)
			}
			return
		}

		if (this.currentState === this.STATE_AMULET_CHOICE) {
			const choice = parseInt(k)
			if (choice >= 1 && choice <= 4) {
				this.executeAmuletEffect(choice)
			}
			return
		}

		// OVERLAND CONTROLS
		if (this.currentState === this.STATE_OVERLAND) {
			let moved = false
			let dx = 0,
				dy = 0

			if (key === 'ArrowUp' || k === 'W' || k === 'N') {
				this.hgrLine1 = 'NORTH'
				dy = -1
				moved = true
			} else if (key === 'ArrowDown' || k === 'S' || key === '/') {
				this.hgrLine1 = 'SOUTH'
				dy = 1
				moved = true
			} else if (key === 'ArrowLeft' || k === 'A') {
				this.hgrLine1 = 'WEST'
				dx = -1
				moved = true
			} else if (key === 'ArrowRight' || k === 'D' || k === 'E') {
				this.hgrLine1 = 'EAST'
				dx = 1
				moved = true
			} else if (k === 'X' || key === 'Enter') {
				// Enter location (216 in BASIC)
				const tile = this.TE[this.TX][this.TY]
				if (tile === 3) {
					this.openAdventureShop()
					return
				} else if (tile === 4) {
					this.enterDungeon()
					return
				} else if (tile === 5) {
					this.enterCastle()
					return
				} else {
					this.hgrLine1 = 'HUH?'
					this.hgrLine2 = ''
					this.updateHGRText()
				}
				return
			} else if (k === ' ' || k === 'P') {
				this.hgrLine1 = 'PASS'
				this.hgrLine2 = ''
				this.endTurn()
				return
			} else if (k === 'I' || k === 'TAB') {
				// Stats screen
				this.setScreenMode('TEXT')
				this.currentState = this.STATE_STATS_VIEW
				this.renderScreen()
				return
			}

			if (moved) {
				const nx = this.TX + dx
				const ny = this.TY + dy
				if (nx >= 0 && nx <= 20 && ny >= 0 && ny <= 20) {
					if (this.TE[nx][ny] === 1) {
						this.hgrLine2 = "YOU CAN'T PASS THE MOUNTAINS"
						this.endTurn()
					} else {
						this.TX = nx
						this.TY = ny
						this.hgrLine2 = ''
						this.endTurn()
					}
				}
			}
			return
		}

		// DUNGEON CONTROLS
		if (this.currentState === this.STATE_DUNGEON) {
			if (key === 'ArrowUp' || k === 'W' || k === 'F' || key === 'Enter') {
				// 1810 Forward
				this.hgrLine1 = 'FORWARD'
				this.hgrLine2 = ''
				const nx = this.PX + this.DX
				const ny = this.PY + this.DY
				if (nx >= 0 && nx <= 10 && ny >= 0 && ny <= 10) {
					const cell = this.DNG[nx][ny]
					if (cell !== 1 && cell < 10) {
						this.PX = nx
						this.PY = ny

						if (cell === 2) {
							// Trap! (line 2040)
							const trapDmg = Math.floor(Math.random() * this.INOUT + 3)
							this.C[0] -= trapDmg
							this.hgrLine1 = 'AAARRRGGGHHH!!! A TRAP!'
							this.hgrLine2 = `FALLING TO LEVEL ${this.INOUT + 1}`
							this.generateDungeonLevel(this.INOUT + 1)
						} else if (cell === 5) {
							// Chest! (line 2060)
							this.DNG[nx][ny] = 0
							const z = Math.floor(Math.random() * 5 * this.INOUT + this.INOUT)
							this.C[5] += z
							this.hgrLine1 = 'GOLD!!!!!'
							this.hgrLine2 = `${z}-PIECES OF EIGHT`
							if (z > 0) {
								const it = Math.floor(Math.random() * 6)
								this.PW[it] += 1
								this.hgrLine2 += ` AND A ${this.W_NAMES[it]}`
							}
						}
						this.endTurn()
					} else {
						this.endTurn()
					}
				}
			} else if (key === 'ArrowLeft' || k === 'L') {
				// 1830 Turn Left
				this.hgrLine1 = 'TURN LEFT'
				this.hgrLine2 = ''
				if (this.DX !== 0) {
					this.DY = -this.DX
					this.DX = 0
				} else {
					this.DX = this.DY
					this.DY = 0
				}
				this.endTurn()
			} else if (key === 'ArrowRight' || k === 'R') {
				// 1820 Turn Right
				this.hgrLine1 = 'TURN RIGHT'
				this.hgrLine2 = ''
				if (this.DX !== 0) {
					this.DY = this.DX
					this.DX = 0
				} else {
					this.DX = -this.DY
					this.DY = 0
				}
				this.endTurn()
			} else if (key === 'ArrowDown' || k === 'T') {
				// 1840 Turn Around
				this.hgrLine1 = 'TURN AROUND'
				this.hgrLine2 = ''
				this.DX = -this.DX
				this.DY = -this.DY
				this.endTurn()
			} else if (k === 'X') {
				// 1850 Climb Ladder Up or Down
				const cur = this.DNG[this.PX][this.PY]
				if (cur === 7 || cur === 9) {
					this.hgrLine1 = `GO DOWN TO LEVEL ${this.INOUT + 1}`
					this.hgrLine2 = ''
					this.generateDungeonLevel(this.INOUT + 1)
					this.endTurn()
				} else if (cur === 8) {
					if (this.INOUT === 1) {
						this.leaveDungeon()
					} else {
						this.hgrLine1 = `GO UP TO LEVEL ${this.INOUT - 1}`
						this.hgrLine2 = ''
						this.generateDungeonLevel(this.INOUT - 1)
						this.endTurn()
					}
				} else {
					this.hgrLine1 = 'HUH?'
					this.hgrLine2 = ''
					this.updateHGRText()
				}
			} else if (k === 'A') {
				// 1860 Attack
				this.currentState = this.STATE_ATTACK
				this.hgrLine1 = 'ATTACK'
				this.hgrLine2 = 'WHICH WEAPON ?'
				this.updateHGRText()
			} else if (k === ' ' || k === 'P') {
				this.hgrLine1 = 'PASS'
				this.hgrLine2 = ''
				this.endTurn()
			} else if (k === 'S') {
				this.setScreenMode('TEXT')
				this.currentState = this.STATE_STATS_VIEW
				this.renderScreen()
			}
		}
	}

	chooseAttackWeapon(key) {
		let dam = 0
		let weaponIndex = -1

		if (key === 'R') {
			weaponIndex = 1
			dam = 10
			this.hgrLine2 = 'RAPIER'
		} else if (key === 'A') {
			weaponIndex = 2
			dam = 5
			this.hgrLine2 = 'AXE'
		} else if (key === 'S') {
			weaponIndex = 3
			dam = 1
			this.hgrLine2 = 'SHIELD'
		} else if (key === 'B') {
			weaponIndex = 4
			dam = 4
			this.hgrLine2 = 'BOW'
		} else if (key === 'M') {
			weaponIndex = 5
			this.hgrLine2 = 'MAGIC AMULET'
		} else {
			this.hgrLine2 = 'HANDS'
			dam = 0
		}

		if (weaponIndex > 0 && this.PW[weaponIndex] < 1) {
			this.hgrLine2 = 'NOT OWNED'
			this.updateHGRText()
			return
		}

		if (this.PT === 'M') {
			if (key === 'B') {
				this.hgrLine2 = "MAGES CAN'T USE BOWS!"
				this.updateHGRText()
				return
			}
			if (key === 'R') {
				this.hgrLine2 = "MAGES CAN'T USE RAPIERS!"
				this.updateHGRText()
				return
			}
		}

		if (key === 'M') {
			// Magic Amulet (line 2620)
			if (this.PT === 'F') {
				// Fighter gets random effect 1-4
				const q = Math.floor(Math.random() * 4 + 1)
				this.executeAmuletEffect(q)
			} else {
				// Mage chooses 1-4
				this.currentState = this.STATE_AMULET_CHOICE
				this.hgrLine1 = '1-LADDER-UP  2-LADDER-DN'
				this.hgrLine2 = '3-KILL       4-BAD?? CHOICE?'
				this.updateHGRText()
			}
			return
		}

		if (dam === 5) {
			// Axe: throw or swing? (line 2570)
			this.currentState = this.STATE_AXE_CHOICE
			this.hgrLine1 = 'TO THROW OR SWING: (T/S)?'
			this.updateHGRText()
			return
		}

		if (dam === 4) {
			// Bow: ranged attack up to 5 tiles
			this.executeRangedAttack(4, 5)
			return
		}

		// Melee attack (hands, rapier, shield)
		this.executeMeleeAttack(dam)
	}

	executeAmuletEffect(choice) {
		if (Math.random() > 0.75) {
			this.PW[5] -= 1
			this.hgrLine2 = 'LAST CHARGE ON THIS AMULET!'
		}

		if (choice === 1) {
			this.hgrLine1 = 'LADDER UP'
			this.DNG[this.PX][this.PY] = 8
			this.currentState = this.STATE_DUNGEON
			this.endTurn()
		} else if (choice === 2) {
			this.hgrLine1 = 'LADDER DOWN'
			this.DNG[this.PX][this.PY] = 7
			this.currentState = this.STATE_DUNGEON
			this.endTurn()
		} else if (choice === 3) {
			this.hgrLine1 = 'MAGIC ATTACK'
			this.executeRangedAttack(10 + this.INOUT, 5)
		} else if (choice === 4) {
			const badRoll = Math.floor(Math.random() * 3 + 1)
			if (badRoll === 1) {
				this.hgrLine1 = 'YOU HAVE BEEN TURNED'
				this.hgrLine2 = 'INTO A TOAD!'
				for (let z = 1; z <= 4; z++) this.C[z] = 3
			} else if (badRoll === 2) {
				this.hgrLine1 = 'YOU HAVE BEEN TURNED'
				this.hgrLine2 = 'INTO A LIZARD MAN'
				for (let y = 0; y <= 4; y++) this.C[y] = Math.floor(this.C[y] * 2.5)
			} else {
				this.hgrLine1 = 'BACKFIRE'
				this.C[0] = Math.floor(this.C[0] / 2)
			}
			this.currentState = this.STATE_DUNGEON
			this.endTurn()
		}
	}

	executeRangedAttack(damage, maxRange) {
		let mn = 0
		for (let y = 1; y <= maxRange; y++) {
			const tx = this.PX + this.DX * y
			const ty = this.PY + this.DY * y
			if (tx < 1 || tx > 9 || ty < 1 || ty > 9) break
			const cell = this.DNG[tx][ty]
			const monster = Math.floor(cell / 10)
			if (monster > 0) {
				mn = monster
				this.resolveCombatHit(mn, damage, tx, ty)
				return
			}
		}
		// Missed or out of range
		this.hgrLine1 = 'YOU MISSED'
		this.currentState = this.STATE_DUNGEON
		this.endTurn()
	}

	executeMeleeAttack(damage) {
		const tx = this.PX + this.DX
		const ty = this.PY + this.DY
		const val = tx >= 0 && tx <= 10 && ty >= 0 && ty <= 10 ? this.DNG[tx][ty] : 0
		const mn = Math.floor(val / 10)
		this.resolveCombatHit(mn, damage, tx, ty)
	}

	resolveCombatHit(mn, baseDamage, tx, ty) {
		if (mn < 1 || this.C[2] - Math.random() * 25 < mn + this.INOUT) {
			this.hgrLine1 = 'YOU MISSED'
			this.currentState = this.STATE_DUNGEON
			this.endTurn()
			return
		}

		const actualDamage = Math.floor(Math.random() * baseDamage + this.C[1] / 5 + 1)
		this.MZ[mn][1] -= actualDamage
		this.hgrLine1 = 'HIT!!!'
		this.hgrLine2 = `${this.M_NAMES[mn]}'S HIT POINTS=${Math.max(0, this.MZ[mn][1])}`

		if (this.MZ[mn][1] < 1) {
			const da = mn + this.INOUT
			this.C[5] += da
			this.DNG[tx][ty] = 0
			this.MZ[mn][0] = 0
			this.LK += Math.floor((mn * this.INOUT) / 2)
			this.hgrLine1 = `THOU HAST KILLED A ${this.M_NAMES[mn]}`
			this.hgrLine2 = `THOU SHALT RECEIVE ${da} PIECES OF EIGHT`

			if (mn === this.TASK) {
				this.TASK = -this.TASK
			}
		}

		this.currentState = this.STATE_DUNGEON
		this.endTurn()
	}

	monsterTurn() {
		for (let mm = 1; mm <= 10; mm++) {
			if (this.MZ[mm][0] === 0) continue

			const ra = Math.hypot(this.PX - this.ML[mm][0], this.PY - this.ML[mm][1])
			if (ra < 1.3) {
				// Monster attacks! (line 3120)
				if (mm === 2 || mm === 7) {
					if (Math.random() >= 0.5) {
						if (mm === 7) {
							this.PW[0] = Math.floor(this.PW[0] / 2)
							this.hgrLine1 = 'A GREMLIN STOLE SOME FOOD'
							continue
						} else {
							for (let w = 5; w >= 1; w--) {
								if (this.PW[w] > 0) {
									this.PW[w] -= 1
									this.hgrLine1 = `A THIEF STOLE A ${this.W_NAMES[w]}`
									break
								}
							}
							continue
						}
					}
				}

				this.hgrLine1 = `YOU ARE BEING ATTACKED BY A ${this.M_NAMES[mm]}`
				const shieldBonus = this.PW[3] > 0 ? 1 : 0
				if (Math.random() * 20 - shieldBonus - this.C[3] + mm + this.INOUT < 0) {
					this.hgrLine2 = 'MISSED'
				} else {
					const monDmg = Math.floor(Math.random() * mm + this.INOUT)
					this.C[0] -= monDmg
					this.hgrLine2 = `HIT FOR ${monDmg}`
				}
			} else {
				// Monster movement (lines 2970-3070)
				let x1 = Math.sign(this.PX - this.ML[mm][0])
				let y1 = Math.sign(this.PY - this.ML[mm][1])

				if (this.MZ[mm][1] < this.INOUT * this.LP) {
					// Flee if low on health!
					x1 = -x1
					y1 = -y1
				}

				if (y1 !== 0) {
					const d = this.DNG[this.ML[mm][0]][this.ML[mm][1] + y1]
					if (d === 1 || d > 9 || d === 2) {
						x1 = 0
					} else {
						x1 = 0
						this.DNG[this.ML[mm][0]][this.ML[mm][1]] -= 10 * mm
						this.ML[mm][1] += y1
						this.DNG[this.ML[mm][0]][this.ML[mm][1]] += 10 * mm
						continue
					}
				}

				if (x1 !== 0) {
					const d = this.DNG[this.ML[mm][0] + x1][this.ML[mm][1]]
					if (!(d === 1 || d > 9 || d === 2)) {
						this.DNG[this.ML[mm][0]][this.ML[mm][1]] -= 10 * mm
						this.ML[mm][0] += x1
						this.DNG[this.ML[mm][0]][this.ML[mm][1]] += 10 * mm
					}
				}
			}
		}
	}

	endTurn() {
		// 1920 PW(0) = PW(0) - 1 + SGN(INOUT) * .9
		const cost = this.INOUT > 0 ? 0.1 : 1.0

		if (this.PW[0] > 0) {
			this.PW[0] = Math.max(0, this.PW[0] - cost)
			if (this.PW[0] === 0) {
				this.hgrLine2 = 'OUT OF FOOD! THOU ART STARVING!'
			}
		} else {
			// Moved with 0 food: starvation death
			this.C[0] = 0
			this.hgrLine1 = 'YOU HAVE STARVED!!!!!'
		}

		this.PW[0] = Math.floor(this.PW[0] * 10) / 10

		if (this.C[0] <= 0) {
			this.setScreenMode('TEXT')
			this.currentState = this.STATE_DEAD
			this.renderScreen()
			return
		}

		if (this.INOUT > 0) {
			this.monsterTurn()
			if (this.C[0] <= 0) {
				this.setScreenMode('TEXT')
				this.currentState = this.STATE_DEAD
				this.renderScreen()
				return
			}
			this.drawDungeon()
		} else {
			this.drawOverland()
		}

		this.updateHGRText()
	}
}
