import { config } from "dotenv";
import app from "./app";
config();

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Orphanage account server API listening on port ${process.env.PORT || 5000}`
  );
});
