const express = require("express");
const Product = require("../models/product");
const slugify = require("slugify");
const { adminMiddleware } = require("./middlewares");
const { tokenVerify } = require("./middlewares");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/product", async (req, res) => {
  const product = await Product.find();
  if (!product) {
    return res.send("this product is not founded");
  } else {
    return res.send({
      message: "successfully",
      product: product,
    });
  }
});

router.post(
  "/product",
  tokenVerify,
  adminMiddleware,
  upload.array("pictures"),
  async (req, res) => {
    const {
      name,
      price,
      description,

      category,
      quantity,
      reviews,

      createdBy,
    } = req.body;
    let files = [];
    if (req.files.length > 0) {
      files = req.files.map((file) => {
        return { img: file.filename };
      });
    }
    const product = new Product({
      name,
      slug: slugify(req.body.name),
      category,
      description,
      quantity,
      price,
      reviews,
      pictures: files,
      createdBy: req.user._id,
    });
    const prod = await product.save();

    res.send({ message: "product created successfully", product: prod });
  }
);
module.exports = router;

// const obj = {
//     name: req.body.name,
//     slug: slugify(req.body.name),
//   };
//   if (req.body.parentId) {
//     obj.parentId = req.body.parentId;
//   }
//   const cat = new Product(obj);
//   cat.save((err, categoty) => {
//     if (err) {
//       return res.status(401).json({ err });
//     }
//     if (category) {
//       return res
//         .status(201)
//         .json({ message: "product created successfully..", product: cat });
//     }
//   });
