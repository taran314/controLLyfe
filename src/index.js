require('./models/workout');
require('./models/user')
const express = require('express');
const mongoose = require('mongoose');
const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(workoutRoutes);
app.use(authRoutes);

const mongoURI = "mongodb+srv://admin:passwordpassword@cluster0.cfznd.mongodb.net/backendTest?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// true stuff prevents errors/warnings apparently

// Messages for connected or if error
mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance!');
});
mongoose.connection.on('error', () => {
  console.error('You don goofed', err);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
})