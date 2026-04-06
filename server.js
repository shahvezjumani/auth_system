import app from "./src/app.js";
import config from "./src/config/index.js";
import connectDB from "./src/config/db.js";

const startServer = async () => {
  try {
    await connectDB();
    console.log("DB connected successfully");

    app.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to DB", err);
    process.exit(1); // exit app
  }
};

startServer();
