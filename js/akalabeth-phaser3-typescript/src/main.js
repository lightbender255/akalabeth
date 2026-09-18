import Phaser from 'phaser'
import akalabeth_scene from './akalabeth_scene'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	backgroundColor: '#000000',
	scene: [akalabeth_scene],
}

export default new Phaser.Game(config)
