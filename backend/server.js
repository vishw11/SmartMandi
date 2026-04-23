const mongoose = require("mongoose");
const app = require("./index");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

app.listen(process.env.PORT, () => { 
  console.log(`Server is running on port ${process.env.PORT}`)
});