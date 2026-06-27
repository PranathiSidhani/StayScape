const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");

// Connect to MongoDB
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayScape");

  console.log("Connected to DB");

  let listings = await Listing.find({});

  for (let listing of listings) {
    let location = `${listing.location}, ${listing.country}`;

    try {
      let response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
        {
          headers: {
            "User-Agent": "StayScape/1.0 (your-email@example.com)",
          },
        },
      );

      if (response.data.length > 0) {
        let place = response.data[0];

        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(place.lon), // longitude
            parseFloat(place.lat), // latitude
          ],
        };

        await listing.save();

        console.log(`Updated ${listing.title} -> ${place.lat}, ${place.lon}`);
      } else {
        console.log(`No coordinates found for ${listing.title}`);
      }
    } catch (err) {
      console.log(`Error updating ${listing.title}`);
      console.log(err.message);
    }

    
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  mongoose.connection.close();
  console.log("Finished updating all listings!");
}

main().catch((err) => {
  console.log(err);
});
