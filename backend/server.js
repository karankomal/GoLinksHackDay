const express = require("express");
const app = express();

app.use(express.json());

app.use("/ghuser", require("./routes/usersRoute"));

app.listen(3001, () => {
	console.log("Express server started on port 3001.");
});
