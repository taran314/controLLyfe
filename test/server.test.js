const createServer = require("./server")
const supertest = require("supertest");
const setupDatabase = require('./helpers/dbHelper');
const mongoose = require("mongoose");

const Workout = mongoose.model('Workout');

setupDatabase();

const app = createServer();

test("GET /workout", async () => {
  // Save the workout
  const workoutTitle = "Leg day"
  const exercises = [{ 
    title: "Squats",
    duration: 60,
    description: "Ow my legs hurt",
    image: "bufflegs.png"
   }]
   
  const workout = new Workout({ workoutTitle, exercises });
  await workout.save();

	await supertest(app)
		.get("/workout")
		.expect(200)
		.then((res) => {
      const workoutResponse = res.body[0];
      
      // Check the response type and length
      expect(res.body.length).toEqual(1)
      // Checking the exercises
      const exercisesResponse = workoutResponse.exercises[0];

      expect(exercisesResponse.title).toEqual("Squats")
      expect(exercisesResponse.duration).toEqual(60)
      expect(exercisesResponse.description).toEqual("Ow my legs hurt")
      expect(exercisesResponse.image).toEqual("bufflegs.png")
      
      expect(workoutResponse.workoutTitle).toEqual(workout.workoutTitle)
		})
})

test("POST /workout", async () => {
  // Send the workout data
  const workoutTitle = "Leg day"
  const exercises = [{ 
    title: "Squats",
    duration: 60,
    description: "Ow my legs hurt",
    image: "bufflegs.png"
   }]
   const data = { workoutTitle, exercises }
 
   await supertest(app)
    .post("/workout")
    .send(data)
    .expect(200)
    .then( async (res) => {
      const workoutResponse = res.body;
      const exercisesResponse = workoutResponse.exercises[0];

      // Checking the workoutTitle
      expect(workoutResponse.workoutTitle).toEqual(workoutTitle)

      // Checking the exercises
      expect(exercisesResponse.title).toEqual("Squats")
      expect(exercisesResponse.duration).toEqual(60)
      expect(exercisesResponse.description).toEqual("Ow my legs hurt")
      expect(exercisesResponse.image).toEqual("bufflegs.png")
      
      // Checking workout is saved in the database
      const workoutDb = await Workout.findOne({_id: res.body._id})
      expect(workoutDb).toBeTruthy()
      expect(workoutDb.workoutTitle).toBe(workoutTitle)
    });
})

test("POST /workout failing request", async () => {
  await supertest(app)
    .post("/workout")
    .expect(422)
    .then( (res) => {
      expect(res.body.error).toEqual("You must provide a workout title and exercises");
    });
})

test("GET /workout:id passing request", async () => {
  // Save the workout
  var workoutTitle = "Leg day"
  var exercises = [{ 
    title: "Squats",
    duration: 60,
    description: "Ow my legs hurt",
    image: "bufflegs.png"
   }]
   
  const workoutOne = new Workout({ workoutTitle, exercises });
  await workoutOne.save();

  workoutTitle = "Upper body day"
  exercises = [{ 
    title: "Bicep curls",
    duration: 30,
    description: "Ow my arms hurt",
    image: "buffarms.png"
   }]

  const workoutTwo = new Workout({ workoutTitle, exercises });
  await workoutTwo.save();

	await supertest(app)
		.get(`/workout/${workoutTwo._id}`)
		.expect(200)
		.then((res) => {
      const workoutTwoResponse = res.body;
      
      // Checking the exercises
      const exercisesResponse = workoutTwoResponse.exercises[0];

      expect(exercisesResponse.title).toEqual(exercises[0].title)
      expect(exercisesResponse.duration).toEqual(exercises[0].duration)
      expect(exercisesResponse.description).toEqual(exercises[0].description)
      expect(exercisesResponse.image).toEqual(exercises[0].image)
      
      expect(workoutTwoResponse.workoutTitle).toEqual(workoutTitle)
		})
})

test("GET /workout:id failing request", async () => {
	await supertest(app)
		.get(`/workout/1`)
		.expect(404)
		.then((res) => {
      console.log(res.body)
      expect(res.body.error).toEqual("Workout doesn't exist!")
		})
})
