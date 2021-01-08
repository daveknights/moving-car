class ThreeJSDefaults {
	constructor(cameraSettings) {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(cameraSettings[0], cameraSettings[1], cameraSettings[2], cameraSettings[3]);
		this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	}

	onWindowResize = () => {
	  this.camera.aspect = window.innerWidth / window.innerHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

class Car extends ThreeJSDefaults {
	// constructor requires camera settings [fov : Number, aspect : Number, near : Number, far : Number]
	constructor(cameraSettings) {
		super(cameraSettings);

		this.renderer.setClearColor(0xaaaaaa);
	    this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		this.camera.position.set(15,10,0).multiplyScalar(3);
		this.controls.update();
	}

	init () {
		// colours
		const white = 0xffffff;
		const road = 0x333333;
		const carColour = 0x225588;
		const wheelColour = 0x888888;
		const coneColour = 0xee680f;

		// car measurements
		const carWidth = 4;
	    const carHeight = 1.75;
	    const carLength = 9;
		const wheelRadius = 1;
	    const wheelThickness = 0.5;
	    const wheelSegments = 10;

		// car
		const car = new THREE.Object3D();
		const carBodyGeometry = new THREE.BoxGeometry(carWidth, carHeight, carLength);
		const carBodyMaterial = new THREE.MeshStandardMaterial({color: carColour});
		const carbody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
		carbody.position.y = 1.8;
	    carbody.castShadow = true;
		const carTopGeometry = new THREE.CylinderGeometry(1.8, 2.8, 1, 4);
		const carTopMaterial = new THREE.MeshStandardMaterial({color: carColour});
		const carTop = new THREE.Mesh(carTopGeometry, carTopMaterial);
		carTop.position.y = 1.4;
		carTop.rotation.y = 0.785;
		const wheelGeometry = new THREE.CylinderBufferGeometry(wheelRadius, wheelRadius, wheelThickness, wheelSegments);
	    const wheelMaterial = new THREE.MeshPhongMaterial({color: wheelColour});
	    const wheelPositions = [
	      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2,  carLength / 3],
	      [ carWidth / 2 + wheelThickness / 2, -carHeight / 2,  carLength / 3],
	      [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
	      [ carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
	    ];
		const wheelMeshes = wheelPositions.map(position => {
	      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
	      wheel.position.set(...position);
	      wheel.rotation.z = Math.PI * 0.5;
	      wheel.castShadow = true;
	      carbody.add(wheel);
	      return wheel;
	    });

		carbody.add(carTop);
		car.add(carbody);
		// cone
		const coneBaseGeometry = new THREE.BoxGeometry(1.7, 0.2	, 1.7);
		const coneBaseMaterial = new THREE.MeshStandardMaterial({color: coneColour});
		const leftConeBase = new THREE.Mesh(coneBaseGeometry, coneBaseMaterial);
		const rightConeBase = new THREE.Mesh(coneBaseGeometry, coneBaseMaterial);
		const coneGeometry = new THREE.CylinderGeometry(0.2, 0.7, 2.4, 12);
		const coneStripeGeometry = new THREE.CylinderGeometry(0.39, 0.52, 0.5, 12);
		const coneMaterial = new THREE.MeshStandardMaterial({color: coneColour});
		const coneStripeMaterial = new THREE.MeshStandardMaterial({color: white});
		const leftCone = new THREE.Mesh(coneGeometry, coneMaterial);
		const leftConeStripe = new THREE.Mesh(coneStripeGeometry, coneStripeMaterial);
		const rightCone = new THREE.Mesh(coneGeometry, coneMaterial);
		const rightConeStripe = new THREE.Mesh(coneStripeGeometry, coneStripeMaterial);

		leftConeBase.add(leftCone);
		leftCone.add(leftConeStripe);
		rightConeBase.add(rightCone);
		rightCone.add(rightConeStripe);
		leftConeBase.position.y = 0.1;
		leftConeBase.position.z = 22.75;
	    leftCone.position.y = 1;
		rightConeBase.position.y = 0.1;
		rightConeBase.position.z = -22.75;
	    rightCone.position.y = 1;

		// light settings
		const intensity = 1;
		const dirLight1 = new THREE.DirectionalLight(white, intensity);
	    dirLight1.position.set(0, 20, 0);
	    dirLight1.castShadow = true;
	    dirLight1.shadow.mapSize.width = 2048;
	    dirLight1.shadow.mapSize.height = 2048;
		const dirLight2 = new THREE.DirectionalLight(white, intensity);
		dirLight2.position.set(1, 2, 4);
		const ambLight = new THREE.AmbientLight(white, 0.3); // soft white light

		// shadow settings
		dirLight1.shadow.camera.left = -50;
	    dirLight1.shadow.camera.right = 50;
	    dirLight1.shadow.camera.top = 50;
	    dirLight1.shadow.camera.bottom = -50;
	    dirLight1.shadow.camera.near = 1;
	    dirLight1.shadow.camera.far = 50;
	    dirLight1.shadow.bias = 0.001;

		// scene ground plane
		const groundGeometry = new THREE.PlaneBufferGeometry(30, 75);
	    const groundMaterial = new THREE.MeshPhongMaterial({color: road});
	    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	    groundMesh.rotation.x = Math.PI * -.5;
	    groundMesh.receiveShadow = true;

		// dash road line
		const dashGeometry = new THREE.Geometry();
		const dashGeometry2 = new THREE.Geometry();
		dashGeometry.vertices.push(new THREE.Vector3(0, -35, 0));
		dashGeometry.vertices.push(new THREE.Vector3(0, 35, 0));
		const dashLineMaterial = new THREE.LineDashedMaterial({ color: white, dashSize: 6.1, gapSize: 3,});
		const dashLine = new THREE.Line(dashGeometry, dashLineMaterial);
		dashLine.computeLineDistances();
		groundMesh.add(dashLine);

		// Create car route path
	    const curve = new THREE.SplineCurve([
	      new THREE.Vector2(-10, -27),
	      new THREE.Vector2(0, 0),
	      new THREE.Vector2(10, 27),
	      new THREE.Vector2(-10, 27),
	      new THREE.Vector2(0, 0),
	      new THREE.Vector2(10, -27),
	      new THREE.Vector2(2, -32),
	      new THREE.Vector2(-7, -30),
	      new THREE.Vector2(-10, -27),
	    ]);

	    const points = curve.getPoints(50);
	    const geometry = new THREE.BufferGeometry().setFromPoints(points);
	    const material = new THREE.LineBasicMaterial({ color : 0x555555, opacity: 0, transparent: true });
	    const splineObject = new THREE.Line(geometry, material);
	    splineObject.rotation.x = Math.PI * 0.5;
	    splineObject.position.y = 0.05;

		const carPosition = new THREE.Vector2();
		const carTarget = new THREE.Vector2();

		const animate = (time) => {
			this.controls.update();
			time *= 0.001;

		    // move car
		    const carTime = time * 0.125;
		    curve.getPointAt(carTime % 1, carPosition);
		    curve.getPointAt((carTime + 0.01) % 1, carTarget);
		    car.position.set(carPosition.x, 0, carPosition.y);
		    car.lookAt(carTarget.x, 0, carTarget.y);

		    wheelMeshes.forEach((obj) => {
		      obj.rotation.x = time * 3;
		    });

			this.renderer.render (this.scene, this.camera);
			requestAnimationFrame(animate);
		};

		// add elements to scene
		this.scene.add(dirLight1, dirLight2, ambLight, groundMesh, splineObject, car, leftConeBase, rightConeBase);

		window.addEventListener('resize', this.onWindowResize, false);

		requestAnimationFrame(animate);
		this.onWindowResize();
	}
}

const car = new Car([50, window.innerWidth / window.innerHeight, 1, 1000]);
car.init();
