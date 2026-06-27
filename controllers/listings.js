const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Sorry! The Stay does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

// module.exports.createListing = async (req, res) => {
//   let newListing = new Listing(req.body.listing);

//   let location = `${newListing.location}, ${newListing.country}`;

//   let response = await axios.get(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
//     {
//       headers: {
//         "User-Agent": "StayScape/1.0",
//       },
//     },
//   );

//   if (response.data.length > 0) {
//     let place = response.data[0];

//     newListing.geometry = {
//       type: "Point",
//       coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
//     };
//   }

//   newListing.owner = req.user._id;

//   await newListing.save();

//   req.flash("success", "New Stay Created!");
//   res.redirect("/listings");
// };

module.exports.createListing = async (req, res) => {
  let newListing = new Listing(req.body.listing);

  // Save uploaded image
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  let location = `${newListing.location}, ${newListing.country}`;

  let response = await axios.get(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
    {
      headers: {
        "User-Agent": "StayScape/1.0",
      },
    },
  );

  if (response.data.length > 0) {
    let place = response.data[0];

    newListing.geometry = {
      type: "Point",
      coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
    };
  }

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Stay Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Sorry! The Stay does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Stay has been Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Stay Deleted!");
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  let { q } = req.query;

  console.log(q);

  if (!q) {
    req.flash("error", "Please enter a search term!");
    return res.redirect("/listings");
  }

  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  if (allListings.length === 0) {
    req.flash("error", "No matching stays found!");
    return res.redirect("/listings");
  }

  res.render("listings/index.ejs", { allListings });
};